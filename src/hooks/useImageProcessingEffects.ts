
import { useEffect } from 'react';
import { revokeObjectUrl } from '@/utils/imageUtils';
import { initializeProcessedImages } from '@/utils/imageProcessingUtils';
import { ProcessedImage } from '@/types/imageProcessing';

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
