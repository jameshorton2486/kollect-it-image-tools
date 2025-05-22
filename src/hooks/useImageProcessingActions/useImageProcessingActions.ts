
import { useCallback } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import { useProcessingActions } from './useProcessingActions';
import { useSelectionActions } from './useSelectionActions';
import { useViewActions } from './useViewActions';
import { useSystemActions } from './useSystemActions';

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
export function useImageProcessingActions(props: UseImageProcessingActionsProps) {
  // Split functionality into sub-hooks
  const processingActions = useProcessingActions(props);
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
    processImage: processingActions.processImage,
    processAllImages: processingActions.processAllImages,
    downloadImage: processingActions.downloadImage,
    downloadAllImages: processingActions.downloadAllImages,
    cancelBatchProcessing: processingActions.cancelBatchProcessing,
    
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
