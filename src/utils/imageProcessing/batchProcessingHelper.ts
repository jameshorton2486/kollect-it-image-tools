
import { ProcessedImage } from '@/types/imageProcessing';

/**
 * Normalize a file into a ProcessedImage object
 */
export function normalizeProcessedImage(file: File): ProcessedImage {
  return {
    originalFile: file,
    original: file,
    originalUrl: URL.createObjectURL(file),
    preview: URL.createObjectURL(file),
    optimizedFiles: {},
    averageCompressionRate: 0,
    totalSizeReduction: 0,
    status: 'pending',
    isProcessing: false,
    isSelected: true,
    originalWidth: 0,
    originalHeight: 0,
    dimensions: {
      width: 0,
      height: 0
    }
  };
}
