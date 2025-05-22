
import { useCallback } from 'react';
import { ProcessedImage, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { 
  processImageUtil, 
  processAllImagesUtil, 
  downloadImageUtil, 
  downloadAllImagesUtil,
  cancelBatchProcessing,
  downloadFormatUtil,
  downloadAllFormatsUtil
} from '@/hooks/useImageProcessingUtils';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';

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
  // Multi-format options
  outputFormat: OutputFormat;
  compressionSettings: CompressionSettings;
  stripMetadata: boolean;
  progressiveLoading: boolean;
  // Resize options
  resizeMode?: ResizeMode;
  resizeUnit?: ResizeUnit;
  resizeQuality?: number;
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
  setExportPath,
  // Multi-format options
  outputFormat,
  compressionSettings,
  stripMetadata,
  progressiveLoading,
  // Resize options
  resizeMode = 'fit',
  resizeUnit = 'px',
  resizeQuality = 80
}: UseProcessingActionsProps) {
  
  // Update with compatible function signature for processImageUtil
  const processImage = useCallback(async (index: number) => {
    // Adapt to match the expected function signature
    const processingOptions = {
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      backgroundType,
      backgroundColor,
      backgroundOpacity,
      backgroundImage,
      outputFormat,
      compressionSettings,
      stripMetadata,
      progressiveLoading,
      resizeMode,
      resizeUnit,
      resizeQuality,
      preserveAspectRatio: true // Default value if not provided
    };

    try {
      await processImageUtil(
        index,
        processedImages,
        processingOptions,
        apiKey,
        selfHosted,
        serverUrl,
        backgroundRemovalModel,
        setProcessedImages
      );
    } catch (error) {
      console.error("Error processing image:", error);
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
    setProcessedImages,
    // Multi-format options
    outputFormat,
    compressionSettings,
    stripMetadata,
    progressiveLoading,
    // Resize options
    resizeMode,
    resizeUnit,
    resizeQuality
  ]);
  
  const handleCancelBatchProcessing = useCallback(() => {
    cancelBatchProcessing();
    setIsProcessing(false);
  }, [setIsProcessing]);
  
  const processAllImagesAction = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      // Adapt to match expected function signature
      const processingOptions = {
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
        backgroundImage,
        outputFormat,
        compressionSettings,
        stripMetadata,
        progressiveLoading,
        resizeMode,
        resizeUnit,
        resizeQuality,
        preserveAspectRatio: true // Default value if not provided
      };

      await processAllImagesUtil(
        processedImages,
        processingOptions,
        apiKey,
        selfHosted,
        serverUrl,
        backgroundRemovalModel,
        setProcessedImages,
        setIsProcessing,
        setBatchProgress,
        setTotalItemsToProcess,
        setProcessedItemsCount
      );
    } catch (error) {
      console.error("Error processing all images:", error);
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
    setProcessedItemsCount,
    // Multi-format options
    outputFormat,
    compressionSettings,
    stripMetadata,
    progressiveLoading,
    // Resize options
    resizeMode,
    resizeUnit,
    resizeQuality
  ]);
  
  const downloadImageAction = useCallback((index: number) => {
    downloadImageUtil(index, processedImages);
  }, [processedImages]);
  
  const downloadAllImagesAction = useCallback(() => {
    downloadAllImagesUtil(processedImages);
  }, [processedImages]);
  
  // New actions for multi-format downloads
  const downloadImageFormatAction = useCallback((index: number, format: string) => {
    downloadFormatUtil(index, format, processedImages);
  }, [processedImages]);
  
  const downloadAllFormatsAction = useCallback((index: number) => {
    downloadAllFormatsUtil(index, processedImages);
  }, [processedImages]);
  
  return {
    processImage,
    processAllImages: processAllImagesAction,
    downloadImage: downloadImageAction,
    downloadAllImages: downloadAllImagesAction,
    cancelBatchProcessing: handleCancelBatchProcessing,
    // New multi-format actions
    downloadImageFormat: downloadImageFormatAction,
    downloadAllFormats: downloadAllFormatsAction,
  };
}
