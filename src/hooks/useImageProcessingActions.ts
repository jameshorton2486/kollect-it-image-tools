import { useCallback } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import { 
  processImageUtil, 
  processAllImagesUtil, 
  downloadImageUtil, 
  downloadAllImagesUtil,
  cancelBatchProcessing
} from './useImageProcessingUtils';
import { clearImageCache } from '@/utils/imageCacheUtils';
import { toast } from '@/hooks/use-toast';
import { clearAnalyticsData } from '@/utils/analyticsUtils';

interface UseImageProcessingActionsProps {
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
  setShowBeforeAfter: React.Dispatch<React.SetStateAction<number | null>>;
  setBatchProgress: React.Dispatch<React.SetStateAction<number>>;
  setTotalItemsToProcess: React.Dispatch<React.SetStateAction<number>>;
  setProcessedItemsCount: React.Dispatch<React.SetStateAction<number>>;
  exportPath: string;
  setExportPath: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Actions hook for image processing
 */
export function useImageProcessingActions({
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
  setShowBeforeAfter,
  setBatchProgress,
  setTotalItemsToProcess,
  setProcessedItemsCount,
  exportPath,
  setExportPath
}: UseImageProcessingActionsProps) {
  
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
  
  const toggleBeforeAfterView = useCallback((index: number | null) => {
    setShowBeforeAfter(prevIndex => prevIndex === index ? null : index);
  }, [setShowBeforeAfter]);
  
  const handleCancelBatchProcessing = useCallback(() => {
    cancelBatchProcessing();
    setIsProcessing(false);
  }, [setIsProcessing]);
  
  const handleClearImageCache = useCallback(() => {
    clearImageCache();
    toast({
      title: "Cache Cleared",
      description: "Image processing cache has been cleared"
    });
  }, []);
  
  const handleClearAnalyticsData = useCallback(() => {
    clearAnalyticsData();
    toast({
      title: "Analytics Cleared",
      description: "Analytics data has been reset"
    });
  }, []);
  
  return {
    processImage,
    processAllImages: useCallback(async () => {
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
    ]),
    downloadImage: useCallback((index: number) => {
      downloadImageUtil(index, processedImages);
    }, [processedImages]),
    downloadAllImages: useCallback(() => {
      downloadAllImagesUtil(processedImages);
    }, [processedImages]),
    toggleSelectImage,
    selectAllImages,
    toggleBeforeAfterView,
    cancelBatchProcessing: handleCancelBatchProcessing,
    clearImageCache: handleClearImageCache,
    clearAnalyticsData: handleClearAnalyticsData
  };
}
