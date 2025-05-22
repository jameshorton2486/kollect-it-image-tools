
import { UseImageProcessingResult } from './useImageProcessingTypes';
import { useImageProcessingState } from './useImageProcessingState';
import { useImageProcessingEffects } from './useImageProcessingEffects';
import { useImageProcessingActions } from './useImageProcessingActions';
import { useEffect } from 'react';
import { WordPressPreset } from '@/types/imageProcessing';
import { WORDPRESS_SIZE_PRESETS } from '@/types/imageResizing';
import { estimateImageSizes } from '@/utils/imageProcessing/multiFormatProcessing';
import useImageResizer from './useImageResizer';

// Stub for missing hook
const useImageProcessingEffects = ({
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
}: any) => {
  // This would contain actual effects in a real implementation
};

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
    estimatedSizes, setEstimatedSizes,
    // Resize options
    resizeMode, setResizeMode,
    resizeUnit, setResizeUnit,
    resizeQuality, setResizeQuality
  } = useImageProcessingState();
  
  // Resizer hook for size estimation
  const { estimateFileSizes } = useImageResizer();
  
  // Update estimated sizes when compression settings or selected image changes
  useEffect(() => {
    // Get first selected image for size estimation
    const selectedImage = processedImages.find(img => img.isSelected);
    if (selectedImage?.original) {
      // Estimate sizes for the selected image
      estimateImageSizes(
        selectedImage.original,
        maxWidth,
        maxHeight,
        compressionSettings
      ).then(sizes => {
        setEstimatedSizes(sizes);
      }).catch(err => {
        console.error("Failed to estimate image sizes:", err);
      });
    }
  }, [
    processedImages, 
    maxWidth, 
    maxHeight, 
    compressionSettings.jpeg.quality, 
    compressionSettings.webp.quality, 
    compressionSettings.avif.quality,
    compressionSettings.webp.lossless,
    compressionSettings.avif.lossless
  ]);

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

  // Temporary mock implementations for actions
  const processImage = async (index: number) => { 
    console.log(`Processing image at index ${index}`);
  };
  
  const processAllImages = async () => {
    console.log('Processing all images');
  };
  
  const downloadImage = (index: number) => {
    console.log(`Downloading image at index ${index}`);
  };
  
  const downloadAllImages = () => {
    console.log('Downloading all images');
  };
  
  const toggleSelectImage = (index: number) => {
    console.log(`Toggling selection for image at index ${index}`);
  };
  
  const selectAllImages = (selected: boolean) => {
    console.log(`Setting all images selected state to: ${selected}`);
  };
  
  const toggleBeforeAfterView = (index: number | null) => {
    console.log(`Toggling before/after view for image at index ${index}`);
  };
  
  const cancelBatchProcessing = () => {
    console.log('Cancelling batch processing');
  };
  
  const clearImageCache = () => {
    console.log('Clearing image cache');
  };
  
  const clearAnalyticsData = () => {
    console.log('Clearing analytics data');
  };
  
  const downloadImageFormat = (imageIndex: number, format: string) => {
    console.log(`Downloading image ${imageIndex} in format ${format}`);
  };
  
  const downloadAllFormats = (imageIndex: number) => {
    console.log(`Downloading all formats for image ${imageIndex}`);
  };
  
  // Handle applying WordPress presets
  const applyWordPressPreset = (preset: WordPressPreset) => {
    // Handle sizes.full if it exists, otherwise use sizes as is
    const width = preset.width || preset.sizes?.width || 2048;
    const height = preset.height || preset.sizes?.height || 2048;
    
    setMaxWidth(width);
    setMaxHeight(height);
    
    // Apply other settings if they exist in the preset
    if (preset.compressionSettings) {
      setCompressionSettings(preset.compressionSettings);
    }
    
    if (preset.stripMetadata !== undefined) {
      setStripMetadata(preset.stripMetadata);
    }
    
    if (preset.progressiveLoading !== undefined) {
      setProgressiveLoading(preset.progressiveLoading);
    }
    
    if (preset.outputFormat) {
      setOutputFormat(preset.outputFormat);
    }
  };

  // Apply resize preset from WordPress sizes
  const applyResizePreset = (presetKey: string) => {
    const preset = WORDPRESS_SIZE_PRESETS[presetKey];
    if (preset) {
      setMaxWidth(preset.width);
      if (preset.height) {
        setMaxHeight(preset.height);
      }
      setPreserveAspectRatio(!preset.crop);
      setResizeMode(preset.crop ? 'crop' : 'fit');
    }
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
    viewHtmlCode,
    // Resize options
    resizeMode,
    setResizeMode,
    resizeUnit, 
    setResizeUnit,
    resizeQuality,
    setResizeQuality,
    applyResizePreset
  };
}
