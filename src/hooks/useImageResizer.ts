
import { useState, useCallback } from 'react';
import { ResizeMode } from '@/types/imageResizing';

interface UseImageResizerProps {
  quality?: number;
}

interface ResizeResult {
  resizedImageData: ImageData | null;
  width: number;
  height: number;
  sizeEstimate: number | null;
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
      outputFormat: string = 'image/jpeg'
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
            resizeQuality / 100
          );
        });
      } catch (error) {
        console.error('Error resizing image:', error);
        throw error;
      }
    },
    [fileToImageData, resizeImageWithWorker, quality]
  );
  
  return {
    isResizing,
    progress,
    resizeFile,
  };
}

export default useImageResizer;
