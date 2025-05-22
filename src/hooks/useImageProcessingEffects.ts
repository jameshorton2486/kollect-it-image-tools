
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
  backgroundType: string;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage?: File | null;
  kollectItApiKey?: string | null;
  kollectItUploadUrl?: string;
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
  backgroundType,
  backgroundColor,
  backgroundOpacity,
  backgroundImage,
  kollectItApiKey,
  kollectItUploadUrl,
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
    localStorage.setItem('background_type', backgroundType);
    localStorage.setItem('background_color', backgroundColor);
    localStorage.setItem('background_opacity', backgroundOpacity.toString());
  }, [backgroundRemovalModel, backgroundType, backgroundColor, backgroundOpacity]);
  
  // Save Kollect-It settings to localStorage
  useEffect(() => {
    if (kollectItApiKey) {
      localStorage.setItem('kollect_it_api_key', kollectItApiKey);
    }
    
    if (kollectItUploadUrl) {
      localStorage.setItem('kollect_it_upload_url', kollectItUploadUrl);
    }
  }, [kollectItApiKey, kollectItUploadUrl]);
}
