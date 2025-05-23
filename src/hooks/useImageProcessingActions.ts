
import { useCallback } from 'react';
import { ProcessedImage, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import useProcessingActions from './useImageProcessingActions/useProcessingActions';
import { useSelectionActions } from './useImageProcessingActions/useSelectionActions';
import { useViewActions } from './useImageProcessingActions/useViewActions';
import { useSystemActions } from './useImageProcessingActions/useSystemActions';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';

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

// Define mock implementations of missing functionality
const mockProcessImage = (index: number) => Promise.resolve();
const mockProcessAllImages = () => Promise.resolve();
const mockDownloadImage = (index: number) => {};
const mockDownloadAllImages = () => {};
const mockCancelBatchProcessing = () => {};
const mockDownloadImageFormat = (index: number, format: string) => {};
const mockDownloadAllFormats = (index: number) => {};

/**
 * Actions hook for image processing
 */
export function useImageProcessingActions(props: UseImageProcessingActionsProps) {
  // Split functionality into sub-hooks
  const processingActions = useProcessingActions({
    ...props,
    processingSettings: {
      quality: props.compressionLevel,
      maxWidth: props.maxWidth,
      maxHeight: props.maxHeight,
      removeBackground: props.removeBackground,
      stripMetadata: props.stripMetadata,
      progressiveLoading: props.progressiveLoading,
      format: props.outputFormat,
      resizeMode: props.resizeMode || 'fit',
      resizeQuality: props.resizeQuality || 80,
      compressionLevel: props.compressionLevel,
      preserveAspectRatio: true,
    },
    wordPressPresetSettings: {
      quality: props.compressionLevel,
      maxWidth: props.maxWidth,
      maxHeight: props.maxHeight,
      removeBackground: props.removeBackground,
      stripMetadata: props.stripMetadata,
      progressiveLoading: props.progressiveLoading,
      format: "webp",
      resizeMode: props.resizeMode || 'fit',
      resizeQuality: props.resizeQuality || 80,
      compressionLevel: props.compressionLevel,
      preserveAspectRatio: true,
    },
    onProcessingStateChange: props.setIsProcessing
  });
  
  const selectionActions = useSelectionActions({
    processedImages: props.processedImages,
    setProcessedImages: props.setProcessedImages
  });
  
  const viewActions = useViewActions({
    setShowBeforeAfter: props.setShowBeforeAfter
  });
  
  const systemActions = useSystemActions();
  
  // Return all actions as a combined object
  return {
    // Processing actions
    processImage: mockProcessImage,
    processAllImages: mockProcessAllImages,
    downloadImage: mockDownloadImage,
    downloadAllImages: mockDownloadAllImages,
    cancelBatchProcessing: mockCancelBatchProcessing,
    // New multi-format actions
    downloadImageFormat: mockDownloadImageFormat,
    downloadAllFormats: mockDownloadAllFormats,
    
    // Selection actions
    toggleSelectImage: selectionActions.toggleSelectImage,
    selectAllImages: selectionActions.selectAllImages,
    
    // View actions
    toggleBeforeAfterView: viewActions.toggleBeforeAfterView,
    
    // System actions
    clearImageCache: systemActions.clearImageCache,
    clearAnalyticsData: systemActions.clearAnalyticsData,
    
    // Export path actions
    exportPath: props.exportPath,
    setExportPath: props.setExportPath
  };
}
