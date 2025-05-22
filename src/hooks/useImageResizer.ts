
import { useState, useCallback } from 'react';
import { ResizeMode } from '@/types/imageResizing';
import { OutputFormat, CompressionSettings } from '@/types/imageProcessing';

interface UseImageResizerProps {
  quality?: number;
}

interface ResizeResult {
  resizedImageData: ImageData | null;
  width: number;
  height: number;
  sizeEstimate: number | null;
}

interface FormatResizeResult extends ResizeResult {
  blob: Blob;
  format: string;
}

export function useImageResizer({ quality = 80 }: UseImageResizerProps = {}) {
  const [isResizing, setIsResizing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Function to resize image with Web Worker
  const resizeImageWithWorker = useCallback(
    async (
      imageData: ImageData,
      targetWidth: number,
      targetHeight: number,
      mode: ResizeMode = 'fit',
      resizeQuality: number = quality
    ): Promise<ResizeResult> => {
      return new Promise((resolve, reject) => {
        setIsResizing(true);
        setProgress(0);
        
        // Create a worker
        const worker = new Worker(
          new URL('../workers/imageResizer.worker.ts', import.meta.url),
          { type: 'module' }
        );
        
        // Handle messages from the worker
        worker.onmessage = (e) => {
          const { type, imageData, width, height, value, error } = e.data;
          
          if (type === 'progress') {
            setProgress(value);
          } else if (type === 'complete') {
            setIsResizing(false);
            setProgress(1);
            
            // Estimate file size
            const pixelCount = width * height;
            const bitsPerPixel = quality / 10; // Rough estimate based on quality
            const sizeEstimateBytes = (pixelCount * bitsPerPixel) / 8;
            
            resolve({
              resizedImageData: imageData,
              width,
              height,
              sizeEstimate: sizeEstimateBytes
            });
            
            worker.terminate();
          } else if (type === 'error') {
            setIsResizing(false);
            reject(new Error(error));
            worker.terminate();
          }
        };
        
        // Handle worker errors
        worker.onerror = (error) => {
          setIsResizing(false);
          reject(error);
          worker.terminate();
        };
        
        // Start the worker
        worker.postMessage({
          imageData,
          targetWidth,
          targetHeight,
          mode,
          quality: resizeQuality
        });
      });
    },
    [quality]
  );
  
  // Utility function to convert a File/Blob to ImageData
  const fileToImageData = useCallback(async (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        URL.revokeObjectURL(url);
        resolve(imageData);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error loading image'));
      };
      
      img.src = url;
    });
  }, []);
  
  // Resize a file directly
  const resizeFile = useCallback(
    async (
      file: File,
      targetWidth: number,
      targetHeight: number,
      mode: ResizeMode = 'fit',
      resizeQuality: number = quality,
      outputFormat: string = 'image/jpeg',
      formatOptions: {
        quality?: number;
        lossless?: boolean;
        progressive?: boolean;
        stripMetadata?: boolean;
      } = {}
    ): Promise<{ blob: Blob; width: number; height: number; sizeEstimate: number }> => {
      try {
        // Convert file to ImageData
        const imageData = await fileToImageData(file);
        
        // Get original dimensions
        const originalWidth = imageData.width;
        const originalHeight = imageData.height;
        
        // Calculate target dimensions based on resize mode
        let finalWidth = targetWidth;
        let finalHeight = targetHeight;
        
        if (mode === 'fit') {
          // Maintain aspect ratio and ensure image fits within target dimensions
          const aspectRatio = originalWidth / originalHeight;
          if (originalWidth > originalHeight) {
            finalWidth = targetWidth;
            finalHeight = Math.round(targetWidth / aspectRatio);
            if (finalHeight > targetHeight) {
              finalHeight = targetHeight;
              finalWidth = Math.round(targetHeight * aspectRatio);
            }
          } else {
            finalHeight = targetHeight;
            finalWidth = Math.round(targetHeight * aspectRatio);
            if (finalWidth > targetWidth) {
              finalWidth = targetWidth;
              finalHeight = Math.round(targetWidth / aspectRatio);
            }
          }
        } else if (mode === 'fill') {
          // Cover the target dimensions, may crop
          const aspectRatio = originalWidth / originalHeight;
          const targetAspectRatio = targetWidth / targetHeight;
          
          if (aspectRatio > targetAspectRatio) {
            // Image is wider than target area
            finalHeight = targetHeight;
            finalWidth = Math.round(targetHeight * aspectRatio);
          } else {
            // Image is taller than target area
            finalWidth = targetWidth;
            finalHeight = Math.round(targetWidth / aspectRatio);
          }
        }
        // 'stretch' mode uses the exact target dimensions
        
        // Resize the image
        const result = await resizeImageWithWorker(
          imageData,
          finalWidth,
          finalHeight,
          mode,
          resizeQuality
        );
        
        // Convert ImageData back to Blob
        const canvas = document.createElement('canvas');
        canvas.width = result.width;
        canvas.height = result.height;
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(result.resizedImageData!, 0, 0);
        
        // Apply format-specific options
        const blobOptions: any = {
          type: outputFormat,
          quality: (formatOptions.quality ?? resizeQuality) / 100
        };

        // Handle format-specific options for modern encoders
        if (outputFormat === 'image/webp' || outputFormat === 'image/avif') {
          // For WebP and AVIF, we might have additional options
          if (typeof formatOptions.lossless === 'boolean') {
            // This can be handled in some browsers that support additional encoding options
            try {
              // Using the canvas convertToBlob API if available (Chrome)
              // @ts-ignore: Some browsers support additional options
              const imageEncoder = new ImageEncoder({
                type: outputFormat.split('/')[1],
                lossless: formatOptions.lossless
              });
              
              // If successful, return the encoded blob
              const blob = await imageEncoder.encode(canvas);
              return {
                blob,
                width: result.width,
                height: result.height,
                sizeEstimate: blob.size
              };
            } catch (e) {
              // Fall back to standard toBlob if ImageEncoder is not available
              console.warn('Advanced image encoding not supported, falling back to standard encoding');
            }
          }
        }
        
        // Get blob with specified quality
        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({
                  blob,
                  width: result.width,
                  height: result.height,
                  sizeEstimate: blob.size
                });
              } else {
                reject(new Error('Error creating blob'));
              }
            },
            outputFormat,
            (formatOptions.quality ?? resizeQuality) / 100
          );
        });
      } catch (error) {
        console.error('Error resizing image:', error);
        throw error;
      }
    },
    [fileToImageData, resizeImageWithWorker, quality]
  );
  
  // New method: Resize and convert to multiple formats
  const resizeToMultipleFormats = useCallback(
    async (
      file: File,
      targetWidth: number,
      targetHeight: number,
      mode: ResizeMode = 'fit',
      compressionSettings: CompressionSettings,
      outputFormat: OutputFormat = 'auto',
      stripMetadata: boolean = true,
      progressiveLoading: boolean = false
    ): Promise<Record<string, { blob: Blob; width: number; height: number; sizeEstimate: number }>> => {
      const results: Record<string, { blob: Blob; width: number; height: number; sizeEstimate: number }> = {};
      
      // Create an array of formats to process based on the outputFormat setting
      let formatsToProcess: Array<{format: string, mimeType: string, settings: any}> = [];
      
      if (outputFormat === 'auto' || outputFormat === 'avif') {
        formatsToProcess.push({
          format: 'avif',
          mimeType: 'image/avif',
          settings: {
            quality: compressionSettings.avif.quality,
            lossless: compressionSettings.avif.lossless,
            stripMetadata
          }
        });
      }
      
      if (outputFormat === 'auto' || outputFormat === 'webp') {
        formatsToProcess.push({
          format: 'webp',
          mimeType: 'image/webp',
          settings: {
            quality: compressionSettings.webp.quality,
            lossless: compressionSettings.webp.lossless,
            stripMetadata
          }
        });
      }
      
      if (outputFormat === 'auto' || outputFormat === 'jpeg') {
        formatsToProcess.push({
          format: 'jpeg',
          mimeType: 'image/jpeg',
          settings: {
            quality: compressionSettings.jpeg.quality,
            progressive: progressiveLoading,
            stripMetadata
          }
        });
      }
      
      // Process each format
      for (const { format, mimeType, settings } of formatsToProcess) {
        try {
          const result = await resizeFile(
            file,
            targetWidth,
            targetHeight,
            mode,
            settings.quality,
            mimeType,
            settings
          );
          
          results[format] = result;
        } catch (error) {
          console.error(`Error processing ${format}:`, error);
          // Continue with other formats
        }
      }
      
      return results;
    },
    [resizeFile]
  );
  
  // Estimate file sizes for different formats without actually processing
  const estimateFileSizes = useCallback(
    async (
      file: File,
      targetWidth: number,
      targetHeight: number,
      compressionSettings: CompressionSettings
    ): Promise<{
      original: number;
      jpeg: number | null;
      webp: number | null;
      avif: number | null;
    }> => {
      try {
        const originalSize = file.size;
        
        // Get image dimensions
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        return new Promise((resolve, reject) => {
          img.onload = () => {
            URL.revokeObjectURL(url);
            
            // Calculate original and target pixels
            const originalPixels = img.width * img.height;
            let targetPixels = targetWidth * targetHeight;
            
            // Adjust for aspect ratio if needed
            const aspectRatio = img.width / img.height;
            if (aspectRatio > 1) { // Landscape
              const calculatedHeight = targetWidth / aspectRatio;
              if (calculatedHeight < targetHeight) {
                targetPixels = targetWidth * calculatedHeight;
              }
            } else { // Portrait or square
              const calculatedWidth = targetHeight * aspectRatio;
              if (calculatedWidth < targetWidth) {
                targetPixels = calculatedWidth * targetHeight;
              }
            }
            
            // Scale factor based on pixel count
            const pixelRatio = targetPixels / originalPixels;
            
            // Base size scaled by pixel ratio
            const baseSize = originalSize * pixelRatio;
            
            // Estimate sizes based on compression quality and format efficiency
            // These are rough estimates and will vary in real-world scenarios
            const jpegFactor = compressionSettings.jpeg.quality / 100;
            const webpFactor = compressionSettings.webp.lossless ? 0.8 : (compressionSettings.webp.quality / 150); // WebP is ~33% smaller at same quality
            const avifFactor = compressionSettings.avif.lossless ? 0.7 : (compressionSettings.avif.quality / 200); // AVIF can be ~50% smaller at same quality
            
            resolve({
              original: originalSize,
              jpeg: Math.round(baseSize * jpegFactor),
              webp: Math.round(baseSize * webpFactor),
              avif: Math.round(baseSize * avifFactor)
            });
          };
          
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Error loading image for size estimation'));
          };
          
          img.src = url;
        });
      } catch (error) {
        console.error('Error estimating file sizes:', error);
        return {
          original: file.size,
          jpeg: null,
          webp: null,
          avif: null
        };
      }
    },
    []
  );
  
  return {
    isResizing,
    progress,
    resizeFile,
    resizeToMultipleFormats,
    estimateFileSizes
  };
}

export default useImageResizer;
