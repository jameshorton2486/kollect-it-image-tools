import { ImageProcessingSettings, ProcessedImage } from '@/types/imageProcessing';
import { processSingleImage } from './processingCore';
import { estimateImageSize } from './processingHelpers';

// Process a single image in multiple formats
export const processSingleImageInMultipleFormats = async (
  image: File,
  settings: ImageProcessingSettings
): Promise<ProcessedImage> => {
  const { format, quality } = settings;

  // Determine the formats to convert to
  const formats = format === 'auto' ? ['avif', 'webp', 'jpeg'] : [format];

  // Process the image in the original format first
  const processedImage = await processSingleImage(image, settings);

  // Convert the image to the other formats
  const convertedImages = await Promise.all(
    formats.map(async (format) => {
      if (format === processedImage.originalFormat) {
        return {
          format: format,
          blob: processedImage.blob,
          size: processedImage.size,
          width: processedImage.width,
          height: processedImage.height,
        };
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      const img = await createImageBitmap(processedImage.blob);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const convertedBlob = await convertToFormat(canvas, format, settings);
      const size = convertedBlob.size;
      return {
        format: format,
        blob: convertedBlob,
        size: size,
        width: img.width,
        height: img.height,
      };
    })
  );

  // Return the processed image with the converted images
  return {
    ...processedImage,
    convertedImages: convertedImages,
  };
};

// Estimate file sizes for different formats
export const estimateImageSizes = (
  width: number,
  height: number,
  settings: ImageProcessingSettings
): Record<string, number> => {
  const { format, quality } = settings;
  const sizes: Record<string, number> = {};

  // Determine the formats to estimate sizes for
  const formats = format === 'auto' ? ['avif', 'webp', 'jpeg'] : [format];

  for (const format of formats) {
    const estimatedSize = estimateImageSize(width, height, format, quality);
    sizes[format] = estimatedSize;
  }

  return sizes;
};

// Convert image to a specific format
export const convertToFormat = async (
  canvas: HTMLCanvasElement,
  format: string,
  settings: ImageProcessingSettings
): Promise<Blob> => {
  const { quality } = settings;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Could not convert to ${format}`));
        }
      },
      `image/${format === 'jpeg' ? 'jpeg' : format}`,
      quality / 100
    );
  });
};
