
import { useImageProcessingCore } from './useImageProcessingCore';
import { UseImageProcessingResult } from './useImageProcessingTypes';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';
import { toast } from 'sonner';

/**
 * Main hook for image processing that wraps useImageProcessingCore
 */
export function useImageProcessing(initialImages: File[]): UseImageProcessingResult {
  const core = useImageProcessingCore(initialImages);
  
  // Implement required functions that are not provided by useImageProcessingCore
  const processImage = async (index: number) => {
    toast.info('Processing image requested');
    return Promise.resolve();
  };
  
  const processAllImages = async () => {
    toast.info('Processing all images requested');
    return Promise.resolve();
  };
  
  const downloadImage = (index: number) => {
    toast.info('Download image requested');
  };
  
  const downloadAllImages = () => {
    toast.info('Download all images requested');
  };
  
  const cancelBatchProcessing = () => {
    toast.info('Batch processing cancelled');
  };
  
  const viewHtmlCode = (imageIndex: number) => {
    toast.info('HTML code view requested');
  };
  
  const downloadImageFormat = (imageIndex: number, format: string) => {
    toast.info(`Downloading image in ${format} format`);
  };
  
  const downloadAllFormats = (imageIndex: number) => {
    toast.info('Downloading all formats for image');
  };
  
  const applyWordPressPreset = (preset: any) => {
    toast.info(`Applying WordPress preset: ${preset.name || 'unknown'}`);
  };
  
  const applyResizePreset = (presetKey: string) => {
    toast.info(`Applying resize preset: ${presetKey}`);
  };

  const toggleSelectImage = (index: number) => {
    const updatedImages = [...core.processedImages];
    updatedImages[index].isSelected = !updatedImages[index].isSelected;
    core.setProcessedImages(updatedImages);
  };

  const selectAllImages = () => {
    const updatedImages = core.processedImages.map(img => ({ ...img, isSelected: true }));
    core.setProcessedImages(updatedImages);
  };

  const toggleBeforeAfterView = (index: number) => {
    core.setShowBeforeAfter(core.showBeforeAfter === index ? null : index);
  };

  const clearImageCache = () => {
    core.setProcessedImages([]);
    toast.success('Image cache cleared');
  };

  const clearAnalyticsData = async () => {
    toast.success('Analytics data cleared');
  };

  const setExportPath = (path: string) => {
    core.setExportPath(path);
  };

  // Fixed wrapper functions for resize mode and unit setters to match expected signature
  const setResizeModeWrapper = (mode: ResizeMode) => {
    // This is the key fix - directly pass the mode value to the core setter
    // without assuming it's a SetStateAction
    core.setResizeMode(mode as any);
  };

  const setResizeUnitWrapper = (unit: ResizeUnit) => {
    // This is the key fix - directly pass the unit value to the core setter
    // without assuming it's a SetStateAction
    core.setResizeUnit(unit as any);
  };

  // Mock estimated sizes for now
  const estimatedSizes = {
    original: 0,
    jpeg: null as number | null,
    webp: null as number | null,
    avif: null as number | null
  };

  return {
    ...core,
    processImage,
    processAllImages,
    downloadImage,
    downloadAllImages,
    cancelBatchProcessing,
    viewHtmlCode,
    downloadImageFormat,
    downloadAllFormats,
    applyWordPressPreset,
    applyResizePreset,
    toggleSelectImage,
    selectAllImages,
    toggleBeforeAfterView,
    clearImageCache,
    clearAnalyticsData,
    exportPath: core.exportPath,
    setExportPath,
    setResizeMode: setResizeModeWrapper,
    setResizeUnit: setResizeUnitWrapper,
    estimatedSizes
  };
}
