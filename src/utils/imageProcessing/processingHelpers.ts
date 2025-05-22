
import { ProcessedImage } from '@/types/imageProcessing';

/**
 * Converts a File to a URL string for preview
 */
export const fileToURL = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Creates a ProcessedImage object from a File
 */
export const createProcessedImage = (file: File): ProcessedImage => {
  const url = fileToURL(file);
  return {
    originalFile: file,
    original: file,
    originalUrl: url,
    preview: url,
    optimizedFiles: {},
    averageCompressionRate: 0,
    totalSizeReduction: 0,
    status: 'pending',
    processed: false,
    isProcessing: false,
    isSelected: false,
    originalWidth: 0,
    originalHeight: 0,
    dimensions: {
      width: 0,
      height: 0
    }
  };
};

/**
 * Estimate file size based on dimensions and format
 */
export const estimateImageSize = (width: number, height: number, format: string, quality: number): number => {
  // Bytes per pixel approximation based on format and quality
  let bytesPerPixel = 4; // Default for PNG
  
  if (format === 'jpeg' || format === 'jpg') {
    bytesPerPixel = quality / 100 * 0.25;
  } else if (format === 'webp') {
    bytesPerPixel = quality / 100 * 0.15;
  } else if (format === 'avif') {
    bytesPerPixel = quality / 100 * 0.1;
  }
  
  return Math.round(width * height * bytesPerPixel);
};

/**
 * Format bytes to a human-readable string
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
