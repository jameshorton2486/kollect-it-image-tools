
import { useCallback } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import { 
  processImageUtil, 
  processAllImagesUtil, 
  downloadImageUtil, 
  downloadAllImagesUtil,
  cancelBatchProcessing
} from '@/hooks/useImageProcessingUtils';

interface UseProcessingActionsProps {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  removeBackground: boolean;
  apiKey: string | null;
  selfHosted: boolean;
  serverUrl: string;
  backgroundRemovalModel: string;
  backgroundType: string;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage?: File | null;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setBatchProgress: React.Dispatch<React.SetStateAction<number>>;
  setTotalItemsToProcess: React.Dispatch<React.SetStateAction<number>>;
  setProcessedItemsCount: React.Dispatch<React.SetStateAction<number>>;
  exportPath: string;
  setExportPath: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Hook for image processing-related actions
 */
export function useProcessingActions({
  processedImages,
  setProcessedImages,
  compressionLevel,
  maxWidth,
  maxHeight,
  removeBackground,
  apiKey,
  selfHosted,
  serverUrl,
  backgroundRemovalModel,
  backgroundType,
  backgroundColor,
  backgroundOpacity,
  backgroundImage,
  isProcessing,
  setIsProcessing,
  setBatchProgress,
  setTotalItemsToProcess,
  setProcessedItemsCount,
  exportPath,
  setExportPath
}: UseProcessingActionsProps) {
  
  const processImage = useCallback(async (index: number) => {
    await processImageUtil(
      index,
      processedImages,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      apiKey,
      selfHosted,
      serverUrl,
      backgroundRemovalModel,
      backgroundType,
      backgroundColor,
      backgroundOpacity,
      backgroundImage,
      setProcessedImages
    );
  }, [
    processedImages, 
    compressionLevel, 
    maxWidth, 
    maxHeight, 
    removeBackground, 
    apiKey, 
    selfHosted, 
    serverUrl, 
    backgroundRemovalModel, 
    backgroundType, 
    backgroundColor, 
    backgroundOpacity,
    backgroundImage,
    setProcessedImages
  ]);

  const handleCancelBatchProcessing = useCallback(() => {
    cancelBatchProcessing();
    setIsProcessing(false);
  }, [setIsProcessing]);
  
  const processAllImagesAction = useCallback(async () => {
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
        selfHosted,
        serverUrl,
        backgroundRemovalModel,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
        backgroundImage,
        setProcessedImages,
        setIsProcessing,
        setBatchProgress,
        setTotalItemsToProcess,
        setProcessedItemsCount
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    processedImages, 
    compressionLevel, 
    maxWidth, 
    maxHeight, 
    removeBackground, 
    apiKey, 
    selfHosted, 
    serverUrl, 
    backgroundRemovalModel,
    backgroundType,
    backgroundColor,
    backgroundOpacity,
    backgroundImage,
    isProcessing, 
    setProcessedImages, 
    setIsProcessing,
    setBatchProgress,
    setTotalItemsToProcess,
    setProcessedItemsCount
  ]);
  
  const downloadImageAction = useCallback((index: number) => {
    downloadImageUtil(index, processedImages);
  }, [processedImages]);
  
  const downloadAllImagesAction = useCallback(() => {
    downloadAllImagesUtil(processedImages);
  }, [processedImages]);
  
  return {
    processImage,
    processAllImages: processAllImagesAction,
    downloadImage: downloadImageAction,
    downloadAllImages: downloadAllImagesAction,
    cancelBatchProcessing: handleCancelBatchProcessing,
  };
}
