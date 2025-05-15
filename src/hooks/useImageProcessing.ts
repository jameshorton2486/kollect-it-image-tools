import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { compressImage, createObjectUrl, revokeObjectUrl, downloadFile } from '@/utils/imageUtils';
import { removeImageBackground } from '@/utils/backgroundRemovalApi';
import type { CompressionOptions } from '@/utils/imageUtils';

export interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved: boolean;
}

export function useImageProcessing(initialImages: File[]) {
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
      const initialProcessedImages = initialImages.map(file => ({
        original: file,
        processed: null,
        preview: createObjectUrl(file),
        isProcessing: false,
        isSelected: true,
        hasBackgroundRemoved: false,
      }));
      
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
      let processedFile = image.original;
      let hasBackgroundRemoved = false;
      
      // Step 1: Remove background if enabled
      if (removeBackground) {
        const bgRemovalResult = await removeImageBackground(image.original, apiKey);
        
        if (bgRemovalResult.processedFile) {
          processedFile = bgRemovalResult.processedFile;
          hasBackgroundRemoved = true;
        } else {
          // If background removal failed but we want to continue with compression
          toast({
            title: "Background Removal Failed",
            description: "Proceeding with compression only"
          });
        }
      }
      
      // Step 2: Compress the image (either original or background-removed)
      const compressionOptions: CompressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        initialQuality: compressionLevel / 100,
      };
      
      const compressedFile = await compressImage(processedFile, compressionOptions);
      
      if (compressedFile) {
        const previewUrl = createObjectUrl(compressedFile);
        
        updatedImages[index] = {
          ...updatedImages[index],
          processed: compressedFile,
          preview: previewUrl,
          isProcessing: false,
          hasBackgroundRemoved,
        };
        
        setProcessedImages(updatedImages);
        toast({
          title: "Success",
          description: `Processed ${image.original.name}${hasBackgroundRemoved ? ' with background removal' : ''}`
        });
      } else {
        updatedImages[index].isProcessing = false;
        setProcessedImages(updatedImages);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: `Failed to process ${image.original.name}`
      });
      
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
    
    downloadFile(image.processed, `optimized-${image.original.name}`);
    
    toast({
      title: "Download Complete",
      description: `Downloaded ${image.original.name}`
    });
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
          downloadFile(image.processed, `optimized-${image.original.name}`);
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
