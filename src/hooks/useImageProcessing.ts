
import { UseImageProcessingResult } from './useImageProcessingTypes';
import { useImageProcessingCore } from './useImageProcessingCore';

export type { ProcessedImage } from '@/types/imageProcessing';

export function useImageProcessing(initialImages: File[]): UseImageProcessingResult {
  return useImageProcessingCore(initialImages);
}
