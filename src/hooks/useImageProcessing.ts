
import { useState, useCallback, useEffect } from 'react';
import { revokeObjectUrl } from '@/utils/imageUtils';
import { initializeProcessedImages } from '@/utils/imageProcessingUtils';
import { ProcessedImage } from '@/types/imageProcessing';
import { 
  UseImageProcessingResult 
} from './useImageProcessingTypes';
import { 
  processImageUtil, 
  processAllImagesUtil, 
  downloadImageUtil, 
  downloadAllImagesUtil 
} from './useImageProcessingUtils';

export type { ProcessedImage } from '@/types/imageProcessing';

export function useImageProcessing(initialImages: File[]): UseImageProcessingResult {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1200);
  const [maxHeight, setMaxHeight] = useState<number>(1200);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('removebg_api_key'));
  const [showBeforeAfter, setShowBeforeAfter] = useState<number | null>(null);
  
  // Initialize images on mount
  useEffect(() => {
    if (initialImages.length > 0) {
      const initialProcessedImages = initializeProcessedImages(initialImages);
      setProcessedImages(initialProcessedImages);
    }
  }, [initialImages]);
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      processedImages.forEach(img => {
        if (img.preview) {
          revokeObjectUrl(img.preview);
        }
      });
    };
  }, []);
  
  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('removebg_api_key', apiKey);
    }
  }, [apiKey]);
  
  const processImage = useCallback(async (index: number) => {
    await processImageUtil(
      index,
      processedImages,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      apiKey,
      setProcessedImages
    );
  }, [processedImages, compressionLevel, maxWidth, maxHeight, removeBackground, apiKey]);
  
  const processAllImages = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await processAllImagesUtil(
        processedImages,
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        apiKey,
        setProcessedImages,
        setIsProcessing
      );
    } finally {
      setIsProcessing(false);
    }
  }, [processedImages, compressionLevel, maxWidth, maxHeight, removeBackground, apiKey, isProcessing]);
  
  const downloadImage = useCallback((index: number) => {
    downloadImageUtil(index, processedImages);
  }, [processedImages]);
  
  const downloadAllImages = useCallback(() => {
    downloadAllImagesUtil(processedImages);
  }, [processedImages]);
  
  const toggleSelectImage = useCallback((index: number) => {
    const updatedImages = [...processedImages];
    updatedImages[index].isSelected = !updatedImages[index].isSelected;
    setProcessedImages(updatedImages);
  }, [processedImages]);
  
  const selectAllImages = useCallback((selected: boolean) => {
    const updatedImages = processedImages.map(img => ({
      ...img,
      isSelected: selected
    }));
    setProcessedImages(updatedImages);
  }, [processedImages]);
  
  const toggleBeforeAfterView = useCallback((index: number | null) => {
    setShowBeforeAfter(prevIndex => prevIndex === index ? null : index);
  }, []);
  
  return {
    processedImages,
    compressionLevel,
    setCompressionLevel,
    maxWidth,
    setMaxWidth,
    maxHeight,
    setMaxHeight,
    preserveAspectRatio,
    setPreserveAspectRatio,
    isProcessing,
    processImage,
    processAllImages,
    downloadImage,
    downloadAllImages,
    toggleSelectImage,
    selectAllImages,
    removeBackground,
    setRemoveBackground,
    apiKey,
    setApiKey,
    showBeforeAfter,
    toggleBeforeAfterView
  };
}
