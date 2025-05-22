
import { useState } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import { DEFAULT_BACKGROUND_REMOVAL_MODEL } from '@/utils/backgroundRemovalModels';

/**
 * Core state hook for image processing
 */
export function useImageProcessingState() {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1200);
  const [maxHeight, setMaxHeight] = useState<number>(1200);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('removebg_api_key'));
  const [selfHosted, setSelfHosted] = useState<boolean>(localStorage.getItem('rembg_self_hosted') === 'true');
  const [serverUrl, setServerUrl] = useState<string>(localStorage.getItem('rembg_server_url') || 'http://localhost:5000/remove-bg');
  const [showBeforeAfter, setShowBeforeAfter] = useState<number | null>(null);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [totalItemsToProcess, setTotalItemsToProcess] = useState<number>(0);
  const [processedItemsCount, setProcessedItemsCount] = useState<number>(0);
  const [backgroundRemovalModel, setBackgroundRemovalModel] = useState<string>(
    localStorage.getItem('background_removal_model') || DEFAULT_BACKGROUND_REMOVAL_MODEL
  );
  
  // New state for background options
  const [backgroundType, setBackgroundType] = useState<string>('none');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(100);

  return {
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
    backgroundOpacity, setBackgroundOpacity
  };
}
