import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  processSingleImage,
  processSingleImageInMultipleFormats,
  initializeProcessedImages,
  downloadProcessedImage,
} from '@/utils/imageProcessingUtils';
import { ProcessedImage, ImageProcessingSettings } from '@/types/imageProcessing';
import { exportAllWordPressSnippets } from '@/utils/imageProcessing/wordPressSnippets';
import { saveAnalyticsData, clearAnalyticsData as clearGDriveAnalyticsData } from '@/utils/googleDriveUtils';
import { useGoogleDriveContext } from '@/context/GoogleDriveContext';

interface UseProcessingActionsProps {
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  processingSettings: ImageProcessingSettings;
  wordPressPresetSettings: ImageProcessingSettings;
  onProcessingStateChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

const useProcessingActions = ({
  setProcessedImages,
  processingSettings,
  wordPressPresetSettings,
  onProcessingStateChange,
}: UseProcessingActionsProps) => {
  const [processingStatus, setProcessingStatus] = useState<{ [key: string]: string }>({});
  const { googleDriveReady } = useGoogleDriveContext();

  const clearImageCache = useCallback(() => {
    setProcessedImages([]);
    toast.success('Image cache cleared');
  }, [setProcessedImages]);

  const clearAnalyticsData = useCallback(async () => {
    if (!googleDriveReady) {
      toast.error('Google Drive not ready. Please connect your account.');
      return;
    }

    try {
      await clearGDriveAnalyticsData();
      toast.success('Analytics data cleared from Google Drive');
    } catch (error) {
      console.error('Error clearing analytics data:', error);
      toast.error('Failed to clear analytics data');
    }
  }, [googleDriveReady]);

  const processImage = async (image: File) => {
    try {
      setProcessingStatus(prev => ({ ...prev, [image.name]: 'processing' }));

      // Get the current settings
      const {
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
        backgroundImage,
        resizeMode,
        format,
        quality,
        stripMetadata,
        preserveTransparency,
        useMultiFormat,
        cropSettings,
        preserveAspectRatio
      } = processingSettings;

      // Create a settings object to pass to the processing functions
      const settings = {
        quality,
        maxWidth,
        maxHeight, 
        removeBackground,
        stripMetadata,
        preserveTransparency,
        format,
        resizeMode,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
        backgroundImage,
        cropSettings,
        preserveAspectRatio
      };

      let processedImage;
      
      if (useMultiFormat) {
        // Use the multiformat processing function
        processedImage = await processSingleImageInMultipleFormats(image, settings);
      } else {
        // Use the single format processing function
        processedImage = await processSingleImage(image, settings);
      }

      setProcessedImages(prevImages => {
        const updatedImages = prevImages.map(img =>
          img.originalFile === image ? { ...processedImage, originalFile: image } : img
        );
        return updatedImages;
      });

      setProcessingStatus(prev => ({ ...prev, [image.name]: 'completed' }));
      return processedImage;
    } catch (error) {
      console.error(`Error processing image ${image.name}:`, error);
      setProcessingStatus(prev => ({ ...prev, [image.name]: 'error' }));
      toast.error(`Failed to process ${image.name}`);
    }
  };

  const batchProcessImages = useCallback(async (images: File[]) => {
    if (onProcessingStateChange) {
      onProcessingStateChange(true);
    }
    try {
      const processedResults = await Promise.all(images.map(processImage));
      const validProcessedResults = processedResults.filter(Boolean) as ProcessedImage[];

      setProcessedImages(prevImages => {
        const updatedImages = [...prevImages];
        validProcessedResults.forEach(processedImage => {
          const index = updatedImages.findIndex(img => img.originalFile === processedImage.originalFile);
          if (index !== -1) {
            updatedImages[index] = processedImage;
          } else {
            updatedImages.push(processedImage);
          }
        });
        return updatedImages;
      });

      toast.success(`Successfully processed ${validProcessedResults.length} images`);
    } catch (error) {
      console.error('Batch image processing failed:', error);
      toast.error('Failed to process all images');
    } finally {
      if (onProcessingStateChange) {
        onProcessingStateChange(false);
      }
    }
  }, [setProcessedImages, processingSettings, onProcessingStateChange]);

  const processImageWithWordPressPreset = async (image: File) => {
    try {
      setProcessingStatus(prev => ({ ...prev, [image.name]: 'processing' }));
      
      // Get the WordPress preset settings
      const {
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
        backgroundImage,
        resizeMode,
        quality,
        stripMetadata,
        preserveTransparency,
        cropSettings,
        preserveAspectRatio
      } = wordPressPresetSettings;
      
      // Create settings object
      const settings = {
        quality,
        maxWidth,
        maxHeight,
        removeBackground,
        stripMetadata: true, // Always strip metadata for WordPress
        preserveTransparency,
        format: 'webp', // Default to WebP for WordPress
        resizeMode,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
        backgroundImage,
        cropSettings,
        preserveAspectRatio
      };
      
      // Always use multiple formats for WordPress
      const processedImage = await processSingleImageInMultipleFormats(image, settings);

      setProcessedImages(prevImages => {
        const updatedImages = prevImages.map(img =>
          img.originalFile === image ? { ...processedImage, originalFile: image, productId: 'test-product-123' } : img
        );
        return updatedImages;
      });

      setProcessingStatus(prev => ({ ...prev, [image.name]: 'completed' }));
      return processedImage;
    } catch (error) {
      console.error(`Error processing WordPress image ${image.name}:`, error);
      setProcessingStatus(prev => ({ ...prev, [image.name]: 'error' }));
      toast.error(`Failed to process ${image.name} with WordPress preset`);
    }
  };

  const batchProcessImagesWithWordPressPreset = useCallback(async (images: File[]) => {
    if (!googleDriveReady) {
      toast.error('Google Drive not ready. Please connect your account.');
      return;
    }

    if (onProcessingStateChange) {
      onProcessingStateChange(true);
    }

    try {
      const processedResults = await Promise.all(images.map(processImageWithWordPressPreset));
      const validProcessedResults = processedResults.filter(Boolean) as ProcessedImage[];

      setProcessedImages(prevImages => {
        const updatedImages = [...prevImages];
        validProcessedResults.forEach(processedImage => {
          const index = updatedImages.findIndex(img => img.originalFile === processedImage.originalFile);
          if (index !== -1) {
            updatedImages[index] = { ...processedImage, productId: 'test-product-123' };
          } else {
            updatedImages.push({ ...processedImage, productId: 'test-product-123' });
          }
        });
        return updatedImages;
      });

      // Save analytics data to Google Drive
      await saveAnalyticsData(validProcessedResults);

      toast.success(`Successfully processed ${validProcessedResults.length} images with WordPress preset`);
    } catch (error) {
      console.error('Batch WordPress image processing failed:', error);
      toast.error('Failed to process all images with WordPress preset');
    } finally {
      if (onProcessingStateChange) {
        onProcessingStateChange(false);
      }
    }
  }, [setProcessedImages, wordPressPresetSettings, googleDriveReady, onProcessingStateChange]);

  const downloadAllImages = useCallback(async (images: ProcessedImage[]) => {
    if (images.length === 0) {
      toast.error('No images available to download');
      return;
    }

    try {
      images.forEach(image => {
        if (image.processedBlob) {
          downloadProcessedImage(image);
        } else {
          console.warn('Image not processed, downloading original file:', image.originalFile.name);
          const url = URL.createObjectURL(image.originalFile);
          const link = document.createElement('a');
          link.href = url;
          link.download = image.originalFile.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
      toast.success(`Downloading ${images.length} images`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download images');
    }
  }, []);

  const exportAllWordPressHTMLSnippets = useCallback(async (images: ProcessedImage[]) => {
    if (!googleDriveReady) {
      toast.error('Google Drive not ready. Please connect your account.');
      return;
    }
    try {
      await exportAllWordPressSnippets(images);
    } catch (error) {
      console.error('Error exporting WordPress snippets:', error);
      toast.error('Failed to export WordPress HTML snippets');
    }
  }, [googleDriveReady]);

  return {
    processingStatus,
    batchProcessImages,
    batchProcessImagesWithWordPressPreset,
    downloadAllImages,
    exportAllWordPressHTMLSnippets,
    clearImageCache,
    clearAnalyticsData
  };
};

export default useProcessingActions;
