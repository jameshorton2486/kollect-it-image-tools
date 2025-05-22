
import { useState } from 'react';
import { OutputFormat } from '@/types/imageProcessing';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';

/**
 * Hook for image resizing functionality
 */
export default function useImageResizer() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  /**
   * Estimate file sizes based on image dimensions and format
   */
  const estimateFileSizes = (
    originalSize: number,
    width: number,
    height: number,
    format: OutputFormat,
    quality: number
  ) => {
    // Simple estimation logic - would be more sophisticated in a real app
    const pixelRatio = (width * height) / (1920 * 1080);
    const qualityFactor = quality / 100;
    
    let formatFactor = 1.0;
    if (format === 'webp') formatFactor = 0.7;
    else if (format === 'avif') formatFactor = 0.5;
    
    const estimatedSize = originalSize * pixelRatio * qualityFactor * formatFactor;
    
    return Math.round(estimatedSize);
  };
  
  return {
    dimensions,
    setDimensions,
    estimateFileSizes
  };
}
