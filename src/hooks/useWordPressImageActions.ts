
import { useCallback } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import { WORDPRESS_IMAGE_TYPES } from '@/types/wordpressImageTypes';
import { toast } from 'sonner';

interface UseWordPressImageActionsProps {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  exportPath: string;
  setExportPath: React.Dispatch<React.SetStateAction<string>>;
  maxWidth: number;
  maxHeight: number;
  setMaxWidth: (width: number) => void;
  setMaxHeight: (height: number) => void;
}

export function useWordPressImageActions({
  processedImages,
  setProcessedImages,
  exportPath,
  setExportPath,
  maxWidth,
  maxHeight,
  setMaxWidth,
  setMaxHeight
}: UseWordPressImageActionsProps) {
  
  const applyWordPressType = useCallback((imageIndex: number, typeId: string) => {
    if (imageIndex < 0 || imageIndex >= processedImages.length) return;
    
    const wpType = WORDPRESS_IMAGE_TYPES.find(t => t.id === typeId);
    if (!wpType) return;
    
    const updatedImages = [...processedImages];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      wordpressType: typeId
    };
    
    setProcessedImages(updatedImages);
    
    toast.success(`Applied ${wpType.name} to image`);
    
  }, [processedImages, setProcessedImages]);
  
  const applyBulkWordPressType = useCallback((typeId: string) => {
    const wpType = WORDPRESS_IMAGE_TYPES.find(t => t.id === typeId);
    if (!wpType) return;
    
    // Update the dimension settings
    setMaxWidth(wpType.recommendedWidth);
    setMaxHeight(wpType.recommendedHeight);
    
    // Update all selected images
    const updatedImages = processedImages.map(img => 
      img.isSelected 
        ? { ...img, wordpressType: typeId }
        : img
    );
    
    setProcessedImages(updatedImages);
    
    toast.success(`Applied ${wpType.name} settings to selected images`);
    
    // Save export path to localStorage
    localStorage.setItem('export_path', exportPath);
    
  }, [processedImages, setProcessedImages, setMaxWidth, setMaxHeight, exportPath]);
  
  const renameImage = useCallback((imageIndex: number, newName: string) => {
    if (imageIndex < 0 || imageIndex >= processedImages.length) return;
    
    const updatedImages = [...processedImages];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      newFilename: newName
    };
    
    setProcessedImages(updatedImages);
    
  }, [processedImages, setProcessedImages]);
  
  const setOutputFormat = useCallback((imageIndex: number, format: string) => {
    if (imageIndex < 0 || imageIndex >= processedImages.length) return;
    
    const updatedImages = [...processedImages];
    updatedImages[imageIndex] = {
      ...updatedImages[imageIndex],
      outputFormat: format
    };
    
    setProcessedImages(updatedImages);
    
  }, [processedImages, setProcessedImages]);
  
  const removeImage = useCallback((index: number) => {
    if (index < 0 || index >= processedImages.length) return;
    
    const updatedImages = [...processedImages];
    updatedImages.splice(index, 1);
    
    setProcessedImages(updatedImages);
    toast.info('Image removed');
    
  }, [processedImages, setProcessedImages]);
  
  return {
    applyWordPressType,
    applyBulkWordPressType,
    renameImage,
    setOutputFormat,
    removeImage
  };
}
