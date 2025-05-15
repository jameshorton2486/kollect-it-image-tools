
import { UseImageProcessingResult } from './useImageProcessingTypes';
import { useImageProcessingState } from './useImageProcessingState';
import { useImageProcessingEffects } from './useImageProcessingEffects';
import { useImageProcessingActions } from './useImageProcessingActions';

/**
 * Core hook for image processing that combines state, effects, and actions
 */
export function useImageProcessingCore(initialImages: File[]): UseImageProcessingResult {
  // Core state management
  const {
    processedImages, setProcessedImages,
    compressionLevel, setCompressionLevel,
    maxWidth, setMaxWidth,
    maxHeight, setMaxHeight,
    preserveAspectRatio, setPreserveAspectRatio,
    isProcessing, setIsProcessing,
    removeBackground, setRemoveBackground,
    apiKey, setApiKey,
    selfHosted, setSelfHosted,
    serverUrl, setServerUrl,
    showBeforeAfter, setShowBeforeAfter,
    batchProgress, setBatchProgress,
    totalItemsToProcess, setTotalItemsToProcess,
    processedItemsCount, setProcessedItemsCount
  } = useImageProcessingState();

  // Initialize and clean up effects
  useImageProcessingEffects({
    initialImages,
    processedImages,
    apiKey,
    selfHosted,
    serverUrl,
    setProcessedImages
  });
  
  // Action methods
  const {
    processImage,
    processAllImages,
    downloadImage,
    downloadAllImages,
    toggleSelectImage,
    selectAllImages,
    toggleBeforeAfterView,
    cancelBatchProcessing
  } = useImageProcessingActions({
    processedImages,
    setProcessedImages,
    compressionLevel,
    maxWidth,
    maxHeight,
    removeBackground,
    apiKey,
    selfHosted,
    serverUrl,
    isProcessing,
    setIsProcessing,
    setShowBeforeAfter,
    setBatchProgress,
    setTotalItemsToProcess,
    setProcessedItemsCount
  });
  
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
    selfHosted,
    setSelfHosted,
    serverUrl,
    setServerUrl,
    showBeforeAfter,
    toggleBeforeAfterView,
    batchProgress,
    totalItemsToProcess,
    processedItemsCount,
    cancelBatchProcessing
  };
}
