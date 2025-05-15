import { useState, useCallback, useEffect } from 'react';
import { revokeObjectUrl } from '@/utils/imageUtils';
import { initializeProcessedImages } from '@/utils/imageProcessingUtils';
import { ProcessedImage } from '@/types/imageProcessing';
import { 
  processImageUtil, 
  processAllImagesUtil, 
  downloadImageUtil, 
  downloadAllImagesUtil 
} from './useImageProcessingUtils';

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
    showBeforeAfter, setShowBeforeAfter
  };
}

interface UseImageProcessingEffectsProps {
  initialImages: File[];
  processedImages: ProcessedImage[];
  apiKey: string | null;
  selfHosted: boolean;
  serverUrl: string;
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
}

/**
 * Effects hook for image processing
 */
export function useImageProcessingEffects({
  initialImages,
  processedImages,
  apiKey,
  selfHosted,
  serverUrl,
  setProcessedImages
}: UseImageProcessingEffectsProps) {
  // Initialize images on mount
  useEffect(() => {
    if (initialImages.length > 0) {
      const initialProcessedImages = initializeProcessedImages(initialImages);
      setProcessedImages(initialProcessedImages);
    }
  }, [initialImages, setProcessedImages]);
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      processedImages.forEach(img => {
        if (img.preview) {
          revokeObjectUrl(img.preview);
        }
      });
    };
  }, [processedImages]);
  
  // Save API key and server settings to localStorage when they change
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('removebg_api_key', apiKey);
    }
    
    localStorage.setItem('rembg_self_hosted', selfHosted.toString());
    
    if (serverUrl) {
      localStorage.setItem('rembg_server_url', serverUrl);
    }
  }, [apiKey, selfHosted, serverUrl]);
}

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
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBeforeAfter: React.Dispatch<React.SetStateAction<number | null>>;
}

/**
 * Actions hook for image processing
 */
export function useImageProcessingActions({
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
  setShowBeforeAfter
}: UseImageProcessingActionsProps) {
  
  const processImage = useCallback(async (index: number) => {
    await processImageUtil(
      index,
      processedImages,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      apiKey,
      selfHosted,
      serverUrl,
      setProcessedImages
    );
  }, [processedImages, compressionLevel, maxWidth, maxHeight, removeBackground, apiKey, selfHosted, serverUrl, setProcessedImages]);
  
  const processAllImages = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      await processAllImagesUtil(
        processedImages,
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        apiKey,
        selfHosted,
        serverUrl,
        setProcessedImages,
        setIsProcessing
      );
    } finally {
      setIsProcessing(false);
    }
  }, [processedImages, compressionLevel, maxWidth, maxHeight, removeBackground, apiKey, selfHosted, serverUrl, isProcessing, setProcessedImages, setIsProcessing]);
  
  const downloadImage = useCallback((index: number) => {
    downloadImageUtil(index, processedImages);
  }, [processedImages]);
  
  const downloadAllImages = useCallback(() => {
    downloadAllImagesUtil(processedImages);
  }, [processedImages]);
  
  const toggleSelectImage = useCallback((index: number) => {
    const updatedImages = [...processedImages];
    updatedImages[index].isSelected = !updatedImages[index].isSelected;
    setProcessedImages(updatedImages);
  }, [processedImages, setProcessedImages]);
  
  const selectAllImages = useCallback((selected: boolean) => {
    const updatedImages = processedImages.map(img => ({
      ...img,
      isSelected: selected
    }));
    setProcessedImages(updatedImages);
  }, [processedImages, setProcessedImages]);
  
  const toggleBeforeAfterView = useCallback((index: number | null) => {
    setShowBeforeAfter(prevIndex => prevIndex === index ? null : index);
  }, [setShowBeforeAfter]);
  
  return {
    processImage,
    processAllImages,
    downloadImage,
    downloadAllImages,
    toggleSelectImage,
    selectAllImages,
    toggleBeforeAfterView
  };
}
