
import { ProcessedImage } from '@/types/imageProcessing';

/**
 * Helper function to ensure processed images conform to the expected shape for batch processing
 */
export const normalizeProcessedImage = (image: File | ProcessedImage): ProcessedImage => {
  // If it's already a properly formed ProcessedImage, return it
  if ('originalFile' in image && 'originalUrl' in image) {
    return image as ProcessedImage;
  }
  
  // If it's a File or partial ProcessedImage, normalize it
  const file = image instanceof File ? image : (image as any).original || image;
  
  return {
    originalFile: file,
    original: file,
    originalUrl: URL.createObjectURL(file),
    preview: URL.createObjectURL(file),
    optimizedFiles: {},
    averageCompressionRate: 0,
    totalSizeReduction: 0,
    status: 'pending',
    processed: false,
    isProcessing: false,
    isSelected: false,
    originalWidth: 0,
    originalHeight: 0,
    dimensions: { width: 0, height: 0 }
  };
};

/**
 * Helper function to safely get the size of a processed format
 */
export const getProcessedSize = (image: ProcessedImage, format?: string): number => {
  if (!image) return 0;
  
  // Try to get size from compressionStats first
  if (image.compressionStats?.formatSizes && format) {
    const size = image.compressionStats.formatSizes[format];
    if (typeof size === 'number') return size;
  }
  
  // Fall back to newSize or blob.size if available
  if (typeof image.newSize === 'number') return image.newSize;
  if (image.blob?.size) return image.blob.size;
  
  // Last resort: original file size
  return image.originalFile?.size || image.original?.size || 0;
};
