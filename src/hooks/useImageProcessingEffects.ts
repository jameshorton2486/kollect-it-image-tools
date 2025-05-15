
import { useEffect } from 'react';
import { initializeProcessedImages } from '@/utils/imageProcessingUtils';
import { ProcessedImage } from '@/types/imageProcessing';

interface UseImageProcessingEffectsProps {
  initialImages: File[];
  processedImages: ProcessedImage[];
  apiKey: string | null;
  selfHosted: boolean;
  serverUrl: string;
  backgroundRemovalModel: string;
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
  backgroundRemovalModel,
  setProcessedImages
}: UseImageProcessingEffectsProps) {
  // Initialize processed images when initial files change
  useEffect(() => {
    if (initialImages.length > 0 && processedImages.length === 0) {
      console.log('Initializing images:', initialImages.map(file => file.name));
      setProcessedImages(initializeProcessedImages(initialImages));
    }
  }, [initialImages, processedImages.length, setProcessedImages]);
  
  // Save API key and self-hosted settings to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('removebg_api_key', apiKey);
    }
    
    localStorage.setItem('rembg_self_hosted', String(selfHosted));
    
    if (serverUrl) {
      localStorage.setItem('rembg_server_url', serverUrl);
    }
  }, [apiKey, selfHosted, serverUrl]);

  // Save background removal model to localStorage
  useEffect(() => {
    localStorage.setItem('background_removal_model', backgroundRemovalModel);
  }, [backgroundRemovalModel]);
}
