
import { useImageProcessingCore } from './useImageProcessingCore';
import { UseImageProcessingResult } from './useImageProcessingTypes';

/**
 * Main hook for image processing that wraps useImageProcessingCore
 */
export function useImageProcessing(initialImages: File[]): UseImageProcessingResult {
  return useImageProcessingCore(initialImages);
}
