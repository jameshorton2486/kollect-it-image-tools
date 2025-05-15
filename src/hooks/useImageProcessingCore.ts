
import { UseImageProcessingResult } from './useImageProcessingTypes';
import { useImageProcessingState } from './useImageProcessingState';
import { useImageProcessingEffects } from './useImageProcessingEffects';
import { useImageProcessingActions } from './useImageProcessingActions';
import { useEffect } from 'react';

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
    processedItemsCount, setProcessedItemsCount,
    backgroundRemovalModel, setBackgroundRemovalModel
  } = useImageProcessingState();

  // Initialize and clean up effects
  useImageProcessingEffects({
    initialImages,
    processedImages,
    apiKey,
    selfHosted,
    serverUrl,
    backgroundRemovalModel,
    setProcessedImages
  });
  
  // Save API key and model selection to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('removebg_api_key', apiKey);
    }
    localStorage.setItem('background_removal_model', backgroundRemovalModel);
  }, [apiKey, backgroundRemovalModel]);

  // Action methods
  const {
    processImage,
    processAllImages,
    downloadImage,
    downloadAllImages,
    toggleSelectImage,
    selectAllImages,
    toggleBeforeAfterView,
    cancelBatchProcessing,
    clearImageCache,
    clearAnalyticsData
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
    backgroundRemovalModel,
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
    backgroundRemovalModel,
    setBackgroundRemovalModel,
    showBeforeAfter,
    toggleBeforeAfterView,
    batchProgress,
    totalItemsToProcess,
    processedItemsCount,
    cancelBatchProcessing,
    clearImageCache,
    clearAnalyticsData
  };
}
