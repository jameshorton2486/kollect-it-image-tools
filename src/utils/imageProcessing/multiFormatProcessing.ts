
import { CompressionSettings, OutputFormat, ProcessedImage } from "@/types/imageProcessing";
import { ResizeMode } from "@/types/imageResizing";

/**
 * Process a single image into multiple formats (AVIF, WebP, JPEG)
 */
export async function processSingleImageInMultipleFormats(
  image: File,
  maxWidth: number,
  maxHeight: number,
  resizeMode: ResizeMode,
  outputFormat: OutputFormat,
  compressionSettings: CompressionSettings,
  stripMetadata: boolean,
  progressiveLoading: boolean
): Promise<{
  primary: File;
  formats: Record<string, File>;
}> {
  // This is a placeholder for the actual implementation
  // The real implementation would use the Canvas API and potentially Web Workers
  // to process the image into different formats

  // Create a list of formats to process based on the outputFormat setting
  const formatsToProcess: string[] = [];
  
  if (outputFormat === 'auto' || outputFormat === 'avif') {
    formatsToProcess.push('avif');
  }
  
  if (outputFormat === 'auto' || outputFormat === 'webp') {
    formatsToProcess.push('webp');
  }
  
  if (outputFormat === 'auto' || outputFormat === 'jpeg') {
    formatsToProcess.push('jpeg');
  }
  
  // Process each format
  const formats: Record<string, File> = {};
  let primaryFile: File = image; // Default to original image
  
  // In a real implementation, we would resize and convert to each format
  // For now, we'll just create mock files for demonstration
  for (const format of formatsToProcess) {
    try {
      // Convert the image to the desired format
      const convertedFile = await convertToFormat(
        image, 
        format, 
        maxWidth, 
        maxHeight, 
        resizeMode,
        format === 'avif' ? compressionSettings.avif.quality : 
        format === 'webp' ? compressionSettings.webp.quality : 
        compressionSettings.jpeg.quality,
        format === 'avif' ? compressionSettings.avif.lossless : 
        format === 'webp' ? compressionSettings.webp.lossless : 
        false,
        progressiveLoading,
        stripMetadata
      );
      
      formats[format] = convertedFile;
      
      // Use the first processed format as the primary file
      if (!primaryFile || format === outputFormat) {
        primaryFile = convertedFile;
      }
    } catch (error) {
      console.error(`Error processing ${format}:`, error);
      // Continue with other formats
    }
  }
  
  return {
    primary: primaryFile,
    formats
  };
}

/**
 * Convert an image to a specific format
 */
export async function convertToFormat(
  image: File,
  format: string,
  width: number,
  height: number,
  resizeMode: ResizeMode = 'fit',
  quality: number = 80,
  lossless: boolean = false,
  progressive: boolean = false,
  stripMetadata: boolean = true
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(image);
    
    img.onload = () => {
      // Calculate dimensions
      let finalWidth = width;
      let finalHeight = height;
      
      if (resizeMode === 'fit') {
        // Maintain aspect ratio
        const aspectRatio = img.width / img.height;
        if (img.width > img.height) {
          finalWidth = width;
          finalHeight = Math.round(width / aspectRatio);
          if (finalHeight > height) {
            finalHeight = height;
            finalWidth = Math.round(height * aspectRatio);
          }
        } else {
          finalHeight = height;
          finalWidth = Math.round(height * aspectRatio);
          if (finalWidth > width) {
            finalWidth = width;
            finalHeight = Math.round(width / aspectRatio);
          }
        }
      } else if (resizeMode === 'fill') {
        // Maintain aspect ratio but ensure it fills the area
        const aspectRatio = img.width / img.height;
        const targetAspectRatio = width / height;
        
        if (aspectRatio > targetAspectRatio) {
          finalHeight = height;
          finalWidth = Math.round(height * aspectRatio);
        } else {
          finalWidth = width;
          finalHeight = Math.round(width / aspectRatio);
        }
      }
      // For 'stretch', we use the exact dimensions
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      
      // Draw image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Strip metadata if requested (by not drawing it)
      if (stripMetadata) {
        ctx.clearRect(0, 0, finalWidth, finalHeight);
      }
      
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      
      // Convert to blob
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                       format === 'webp' ? 'image/webp' : 
                       format === 'avif' ? 'image/avif' : 
                       'image/png';
      
      // Create filename with format extension
      const originalName = image.name;
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      const newFilename = `${baseName}.${format}`;
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], newFilename, { type: mimeType });
            URL.revokeObjectURL(url);
            resolve(file);
          } else {
            URL.revokeObjectURL(url);
            reject(new Error(`Error converting to ${format}`));
          }
        },
        mimeType,
        quality / 100
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error loading image'));
    };
    
    img.src = url;
  });
}

/**
 * Estimate file sizes for different formats
 */
export async function estimateImageSizes(
  image: File,
  width: number,
  height: number,
  compressionSettings: CompressionSettings
): Promise<{
  original: number;
  jpeg: number | null;
  webp: number | null;
  avif: number | null;
}> {
  try {
    // Get image dimensions
    const img = new Image();
    const url = URL.createObjectURL(image);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // Calculate original and target pixels
        const originalPixels = img.width * img.height;
        let targetPixels = width * height;
        
        // Adjust for aspect ratio
        const aspectRatio = img.width / img.height;
        if (aspectRatio > 1) { // Landscape
          const calculatedHeight = width / aspectRatio;
          if (calculatedHeight < height) {
            targetPixels = width * calculatedHeight;
          }
        } else { // Portrait or square
          const calculatedWidth = height * aspectRatio;
          if (calculatedWidth < width) {
            targetPixels = calculatedWidth * height;
          }
        }
        
        // Scale factor based on pixel count
        const pixelRatio = targetPixels / originalPixels;
        
        // Base size scaled by pixel ratio
        const baseSize = image.size * pixelRatio;
        
        // Estimate sizes based on compression quality and format efficiency
        const jpegFactor = compressionSettings.jpeg.quality / 100;
        const webpFactor = compressionSettings.webp.lossless ? 0.8 : (compressionSettings.webp.quality / 150);
        const avifFactor = compressionSettings.avif.lossless ? 0.7 : (compressionSettings.avif.quality / 200);
        
        resolve({
          original: image.size,
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
      original: image.size,
      jpeg: null,
      webp: null,
      avif: null
    };
  }
}
