import { ImageProcessingSettings, ProcessedImage } from '@/types/imageProcessing';
import { handleBackgroundRemoval as removeBg } from './backgroundRemoval';
import { handleCompression as compress } from './compression';
import { toast } from 'sonner';

// Process a single image with the given settings
export const processSingleImage = async (
  image: File,
  settings: ImageProcessingSettings
): Promise<ProcessedImage> => {
  try {
    // Validate settings
    if (!settings) {
      throw new Error('Processing settings are required.');
    }

    // Load the image
    const imageBitmap = await createImageBitmap(image);

    // Create a canvas
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw the image on the canvas
    ctx.drawImage(imageBitmap, 0, 0);

    // Handle background removal
    let processedImageData: ImageData | HTMLCanvasElement = canvas;
    if (settings.removeBackground) {
      processedImageData = await removeBg(canvas, settings);
      if (processedImageData instanceof HTMLCanvasElement) {
        // If background removal returns a canvas, use it
        canvas.width = processedImageData.width;
        canvas.height = processedImageData.height;
        const newCtx = canvas.getContext('2d');
        if (!newCtx) {
          throw new Error('Could not get canvas context after background removal');
        }
        newCtx.drawImage(processedImageData, 0, 0);
      } else {
        // If background removal returns image data, put it on the canvas
        canvas.width = processedImageData.width;
        canvas.height = processedImageData.height;
        ctx.putImageData(processedImageData, 0, 0);
      }
    }

    // Handle image compression
    const compressedImage = await compress(canvas, settings);

    // Convert the compressed image to a base64 string
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(compressedImage);
    });

    // Create a processed image object
    const processedImage: ProcessedImage = {
      originalName: image.name,
      originalSize: image.size,
      mimeType: image.type,
      base64,
      blob: compressedImage,
      processed: true,
      productId: null,
      finalWidth: canvas.width,
      finalHeight: canvas.height,
      format: settings.format,
      quality: settings.quality,
      newSize: compressedImage.size,
    };

    return processedImage;
  } catch (error: any) {
    console.error('Error processing image:', error);
    toast.error(`Image processing failed: ${error.message}`);
    throw error;
  }
};

// Handle background removal processing
export const handleBackgroundRemoval = async (
  imageData: ImageData | HTMLCanvasElement,
  settings: ImageProcessingSettings
): Promise<ImageData | HTMLCanvasElement> => {
  try {
    if (!settings.removeBackground) {
      return imageData;
    }
    
    return await removeBg(imageData, settings);
  } catch (error: any) {
    console.error('Error removing background:', error);
    toast.error(`Background removal failed: ${error.message}`);
    throw error;
  }
};

// Handle image compression
export const handleCompression = async (
  canvas: HTMLCanvasElement,
  settings: ImageProcessingSettings
): Promise<Blob> => {
  try {
    if (!settings) {
      throw new Error('Compression settings are required.');
    }
    
    return await compress(canvas, settings);
  } catch (error: any) {
    console.error('Error compressing image:', error);
    toast.error(`Image compression failed: ${error.message}`);
    throw error;
  }
};
