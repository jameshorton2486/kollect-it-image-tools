
import { useCallback } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';

interface UseSelectionActionsProps {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
}

/**
 * Hook for image selection-related actions
 */
export function useSelectionActions({
  processedImages,
  setProcessedImages
}: UseSelectionActionsProps) {
  
  const toggleSelectImage = useCallback((index: number) => {
    const updatedImages = [...processedImages];
    updatedImages[index].isSelected = !updatedImages[index].isSelected;
    setProcessedImages(updatedImages);
  }, [processedImages, setProcessedImages]);
  
  const selectAllImages = useCallback((selected: boolean) => {
    const updatedImages = processedImages.map(img => ({
      ...img,
      isSelected: selected
    }));
    setProcessedImages(updatedImages);
  }, [processedImages, setProcessedImages]);
  
  return {
    toggleSelectImage,
    selectAllImages
  };
}
