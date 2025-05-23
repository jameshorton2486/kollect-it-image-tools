
import { ProcessedImage } from '@/types/imageProcessing';

/**
 * Initialize a processed image from a File
 */
export const initializeProcessedImages = (file: File): ProcessedImage => {
  const url = URL.createObjectURL(file);
  
  return {
    originalFile: file,
    original: file,
    originalUrl: url,
    preview: url,
    optimizedFiles: {},
    processed: null,
    status: 'pending',
    isProcessing: false,
    isSelected: true,
    averageCompressionRate: 0,
    totalSizeReduction: 0,
    originalWidth: 0,
    originalHeight: 0,
    dimensions: {
      width: 0,
      height: 0
    }
  };
};

/**
 * Download a processed image
 */
export const downloadProcessedImage = (image: ProcessedImage): void => {
  if (!image.processed) {
    console.error('No processed image to download');
    return;
  }
  
  const url = URL.createObjectURL(image.processed);
  const link = document.createElement('a');
  link.href = url;
  link.download = image.newFilename || image.originalFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
