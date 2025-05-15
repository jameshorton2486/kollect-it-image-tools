
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { createObjectUrl, revokeObjectUrl } from '@/utils/imageUtils';
import { 
  processSingleImage, 
  initializeProcessedImages, 
  downloadProcessedImage 
} from '@/utils/imageProcessingUtils';
import { 
  ProcessedImage, 
  UseImageProcessingResult 
} from '@/types/imageProcessing';

export type { ProcessedImage } from '@/types/imageProcessing';

export function useImageProcessing(initialImages: File[]): UseImageProcessingResult {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1200);
  const [maxHeight, setMaxHeight] = useState<number>(1200);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('removebg_api_key'));
  const [showBeforeAfter, setShowBeforeAfter] = useState<number | null>(null);
  
  // Initialize images on mount
  useEffect(() => {
    if (initialImages.length > 0) {
      const initialProcessedImages = initializeProcessedImages(initialImages);
      setProcessedImages(initialProcessedImages);
    }
  }, [initialImages]);
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      processedImages.forEach(img => {
        if (img.preview) {
          revokeObjectUrl(img.preview);
        }
      });
    };
  }, []);
  
  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('removebg_api_key', apiKey);
    }
  }, [apiKey]);
  
  const processImage = useCallback(async (index: number) => {
    const image = processedImages[index];
    if (!image || image.isProcessing) return;
    
    const updatedImages = [...processedImages];
    updatedImages[index].isProcessing = true;
    setProcessedImages(updatedImages);
    
    try {
      const processedImage = await processSingleImage(
        image,
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        apiKey
      );
      
      if (processedImage) {
        updatedImages[index] = processedImage;
        setProcessedImages(updatedImages);
        
        toast({
          title: "Success",
          description: `Processed ${image.original.name}${processedImage.hasBackgroundRemoved ? ' with background removal' : ''}`
        });
      } else {
        updatedImages[index].isProcessing = false;
        setProcessedImages(updatedImages);
      }
    } catch (error) {
      console.error("Error in processImage:", error);
      updatedImages[index].isProcessing = false;
      setProcessedImages(updatedImages);
    }
  }, [processedImages, compressionLevel, maxWidth, maxHeight, removeBackground, apiKey]);
  
  const processAllImages = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const selectedImages = processedImages.filter(img => img.isSelected);
      
      if (selectedImages.length === 0) {
        toast({
          title: "No Images Selected",
          description: "No images selected for processing"
        });
        setIsProcessing(false);
        return;
      }
      
      for (let i = 0; i < processedImages.length; i++) {
        if (processedImages[i].isSelected) {
          await processImage(i);
        }
      }
      
      toast({
        title: "Batch Processing Complete",
        description: "All selected images processed successfully!"
      });
    } catch (error) {
      console.error("Error in batch processing:", error);
      toast({
        variant: "destructive",
        title: "Batch Processing Failed",
        description: "Failed to process some images"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [processedImages, processImage, isProcessing]);
  
  const downloadImage = useCallback((index: number) => {
    const image = processedImages[index];
    if (!image || !image.processed) return;
    
    downloadProcessedImage(image);
  }, [processedImages]);
  
  const downloadAllImages = useCallback(() => {
    const selectedImages = processedImages.filter(img => img.isSelected && img.processed);
    
    if (selectedImages.length === 0) {
      toast({
        title: "No Images to Download",
        description: "No processed images to download"
      });
      return;
    }
    
    selectedImages.forEach((image, index) => {
      setTimeout(() => {
        if (image.processed) {
          downloadProcessedImage(image);
        }
      }, index * 100); // Stagger downloads slightly
    });
    
    toast({
      title: "Bulk Download Started",
      description: `Downloading ${selectedImages.length} images`
    });
  }, [processedImages]);
  
  const toggleSelectImage = useCallback((index: number) => {
    const updatedImages = [...processedImages];
    updatedImages[index].isSelected = !updatedImages[index].isSelected;
    setProcessedImages(updatedImages);
  }, [processedImages]);
  
  const selectAllImages = useCallback((selected: boolean) => {
    const updatedImages = processedImages.map(img => ({
      ...img,
      isSelected: selected
    }));
    setProcessedImages(updatedImages);
  }, [processedImages]);
  
  const toggleBeforeAfterView = useCallback((index: number | null) => {
    setShowBeforeAfter(prevIndex => prevIndex === index ? null : index);
  }, []);
  
  return {
    processedImages,
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
    showBeforeAfter,
    toggleBeforeAfterView
  };
}
