
import { UseImageProcessingResult } from './useImageProcessingTypes';
import { useImageProcessingState } from './useImageProcessingState';
import { useImageProcessingEffects } from './useImageProcessingEffects';
import { useImageProcessingActions } from './useImageProcessingActions';
import { useEffect } from 'react';
import { WordPressPreset } from '@/types/imageProcessing';

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
    backgroundRemovalModel, setBackgroundRemovalModel,
    backgroundType, setBackgroundType,
    backgroundColor, setBackgroundColor,
    backgroundOpacity, setBackgroundOpacity,
    backgroundImage, setBackgroundImage,
    kollectItApiKey, setKollectItApiKey,
    kollectItUploadUrl, setKollectItUploadUrl,
    exportPath, setExportPath,
    // Multi-format options
    outputFormat, setOutputFormat,
    compressionSettings, setCompressionSettings,
    stripMetadata, setStripMetadata,
    progressiveLoading, setProgressiveLoading,
    estimatedSizes
  } = useImageProcessingState();

  // Initialize and clean up effects
  useImageProcessingEffects({
    initialImages,
    processedImages,
    apiKey,
    selfHosted,
    serverUrl,
    backgroundRemovalModel,
    backgroundType,
    backgroundColor,
    backgroundOpacity,
    backgroundImage,
    kollectItApiKey,
    kollectItUploadUrl,
    setProcessedImages
  });
  
  // Save settings to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('removebg_api_key', apiKey);
    }
    localStorage.setItem('background_removal_model', backgroundRemovalModel);
    localStorage.setItem('background_type', backgroundType);
    localStorage.setItem('background_color', backgroundColor);
    localStorage.setItem('background_opacity', backgroundOpacity.toString());
    if (kollectItApiKey) {
      localStorage.setItem('kollect_it_api_key', kollectItApiKey);
    }
    if (kollectItUploadUrl) {
      localStorage.setItem('kollect_it_upload_url', kollectItUploadUrl);
    }
    localStorage.setItem('export_path', exportPath);
  }, [apiKey, backgroundRemovalModel, backgroundType, backgroundColor, backgroundOpacity, kollectItApiKey, kollectItUploadUrl, exportPath]);

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
    clearAnalyticsData,
    exportPath: actionExportPath,
    setExportPath: actionSetExportPath,
    // Multi-format download actions
    downloadImageFormat,
    downloadAllFormats
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
    setExportPath,
    // Multi-format options
    outputFormat,
    compressionSettings,
    stripMetadata,
    progressiveLoading
  });
  
  // Handle applying WordPress presets
  const applyWordPressPreset = (preset: WordPressPreset) => {
    setMaxWidth(preset.sizes.full.width);
    setMaxHeight(preset.sizes.full.height);
    setCompressionSettings(preset.compressionSettings);
    setStripMetadata(preset.stripMetadata);
    setProgressiveLoading(preset.progressiveLoading);
    setOutputFormat(preset.outputFormat);
  };
  
  // Handle showing HTML code preview
  const viewHtmlCode = (imageIndex: number) => {
    // This just returns the index to be handled by the UI component
    return imageIndex;
  };
  
  return {
    processedImages,
    setProcessedImages,
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
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    backgroundOpacity,
    setBackgroundOpacity,
    backgroundImage,
    setBackgroundImage,
    kollectItApiKey,
    setKollectItApiKey,
    kollectItUploadUrl,
    setKollectItUploadUrl,
    showBeforeAfter,
    toggleBeforeAfterView,
    batchProgress,
    totalItemsToProcess,
    processedItemsCount,
    cancelBatchProcessing,
    clearImageCache,
    clearAnalyticsData,
    exportPath,
    setExportPath,
    // Multi-format options
    outputFormat,
    setOutputFormat,
    compressionSettings,
    setCompressionSettings,
    stripMetadata,
    setStripMetadata,
    progressiveLoading,
    setProgressiveLoading,
    estimatedSizes,
    applyWordPressPreset,
    downloadImageFormat,
    downloadAllFormats,
    viewHtmlCode
  };
}
