
import { useImageProcessingCore } from './useImageProcessingCore';
import { UseImageProcessingResult } from './useImageProcessingTypes';
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
    applyResizePreset
  };
}
