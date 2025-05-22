
import { useCallback } from 'react';
import { ProcessedImage, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { 
  processImageUtil, 
  processAllImagesUtil, 
  downloadImageUtil, 
  downloadAllImagesUtil,
  cancelBatchProcessing,
  downloadFormatUtil,
  downloadAllFormatsUtil
} from '@/hooks/useImageProcessingUtils';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';
import { 
  saveFileToDrive, 
  getProductFolderPath, 
  generateProductId,
  RAW_UPLOADS_PATH,
  PROCESSED_IMAGES_PATH,
  saveHtmlSnippet
} from '@/utils/googleDriveUtils';
import { toast } from 'sonner';

interface UseProcessingActionsProps {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  removeBackground: boolean;
  apiKey: string | null;
  selfHosted: boolean;
  serverUrl: string;
  backgroundRemovalModel: string;
  backgroundType: string;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage?: File | null;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setBatchProgress: React.Dispatch<React.SetStateAction<number>>;
  setTotalItemsToProcess: React.Dispatch<React.SetStateAction<number>>;
  setProcessedItemsCount: React.Dispatch<React.SetStateAction<number>>;
  exportPath: string;
  setExportPath: React.Dispatch<React.SetStateAction<string>>;
  // Multi-format options
  outputFormat: OutputFormat;
  compressionSettings: CompressionSettings;
  stripMetadata: boolean;
  progressiveLoading: boolean;
  // Resize options
  resizeMode?: ResizeMode;
  resizeUnit?: ResizeUnit;
  resizeQuality?: number;
}

/**
 * Hook for image processing-related actions
 */
export function useProcessingActions({
  processedImages,
  setProcessedImages,
  compressionLevel,
  maxWidth,
  maxHeight,
  removeBackground,
  apiKey,
  selfHosted,
  serverUrl,
  backgroundRemovalModel,
  backgroundType,
  backgroundColor,
  backgroundOpacity,
  backgroundImage,
  isProcessing,
  setIsProcessing,
  setBatchProgress,
  setTotalItemsToProcess,
  setProcessedItemsCount,
  exportPath,
  setExportPath,
  // Multi-format options
  outputFormat,
  compressionSettings,
  stripMetadata,
  progressiveLoading,
  // Resize options
  resizeMode = 'fit',
  resizeUnit = 'px',
  resizeQuality = 80
}: UseProcessingActionsProps) {
  
  // Update with compatible function signature for processImageUtil
  const processImage = useCallback(async (index: number) => {
    // Adapt to match the expected function signature
    const processingOptions = {
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      backgroundType,
      backgroundColor,
      backgroundOpacity,
      backgroundImage,
      outputFormat,
      compressionSettings,
      stripMetadata,
      progressiveLoading,
      resizeMode,
      resizeUnit,
      resizeQuality,
      preserveAspectRatio: true // Default value if not provided
    };

    try {
      // Process the image
      await processImageUtil(
        index,
        processedImages,
        processingOptions,
        apiKey,
        selfHosted,
        serverUrl,
        backgroundRemovalModel,
        setProcessedImages
      );

      // After processing, save to Google Drive
      const processedImage = processedImages[index];
      if (processedImage.processed) {
        // Generate or use existing product ID
        const productId = processedImage.productId || generateProductId(processedImage.original);
        
        // Update the processed image with a product ID if not already set
        if (!processedImage.productId) {
          setProcessedImages(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], productId };
            return updated;
          });
        }

        // Save original to Raw Uploads
        await saveFileToDrive(processedImage.original, RAW_UPLOADS_PATH);
        
        // Save processed to Processed Images/{productId}
        const productFolder = getProductFolderPath(productId);
        await saveFileToDrive(processedImage.processed, productFolder);
        
        // If we have additional formats, save those too
        if (processedImage.processedFormats) {
          for (const format in processedImage.processedFormats) {
            await saveFileToDrive(processedImage.processedFormats[format], productFolder);
          }
        }

        toast.success(`Saved images to Google Drive folders`);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [
    processedImages, 
    compressionLevel, 
    maxWidth, 
    maxHeight, 
    removeBackground, 
    apiKey, 
    selfHosted, 
    serverUrl, 
    backgroundRemovalModel, 
    backgroundType, 
    backgroundColor, 
    backgroundOpacity,
    backgroundImage,
    setProcessedImages,
    // Multi-format options
    outputFormat,
    compressionSettings,
    stripMetadata,
    progressiveLoading,
    // Resize options
    resizeMode,
    resizeUnit,
    resizeQuality
  ]);
  
  const handleCancelBatchProcessing = useCallback(() => {
    cancelBatchProcessing();
    setIsProcessing(false);
  }, [setIsProcessing]);
  
  const processAllImagesAction = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      // Adapt to match expected function signature
      const processingOptions = {
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
        backgroundImage,
        outputFormat,
        compressionSettings,
        stripMetadata,
        progressiveLoading,
        resizeMode,
        resizeUnit,
        resizeQuality,
        preserveAspectRatio: true // Default value if not provided
      };

      // Process all images
      await processAllImagesUtil(
        processedImages,
        processingOptions,
        apiKey,
        selfHosted,
        serverUrl,
        backgroundRemovalModel,
        setProcessedImages,
        setIsProcessing,
        setBatchProgress,
        setTotalItemsToProcess,
        setProcessedItemsCount
      );

      // After batch processing, save all to Google Drive
      const batchSavePromises = processedImages.map(async (img) => {
        if (img.processed) {
          // Generate or use existing product ID
          const productId = img.productId || generateProductId(img.original);
          
          // Save original to Raw Uploads
          await saveFileToDrive(img.original, RAW_UPLOADS_PATH);
          
          // Save processed to Processed Images/{productId}
          const productFolder = getProductFolderPath(productId);
          await saveFileToDrive(img.processed, productFolder);
          
          // If we have additional formats, save those too
          if (img.processedFormats) {
            for (const format in img.processedFormats) {
              await saveFileToDrive(img.processedFormats[format], productFolder);
            }
          }

          // Generate and save HTML snippet
          if (img.newFilename) {
            const htmlSnippet = generateHtmlSnippet(img, productId);
            await saveHtmlSnippet(productId, htmlSnippet);
          }
        }
      });
      
      await Promise.all(batchSavePromises);
      toast.success(`Batch processed and saved to Google Drive folders`);
      
    } catch (error) {
      console.error("Error processing all images:", error);
      toast.error(`Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [
    processedImages, 
    compressionLevel, 
    maxWidth, 
    maxHeight, 
    removeBackground, 
    apiKey, 
    selfHosted, 
    serverUrl, 
    backgroundRemovalModel,
    backgroundType,
    backgroundColor,
    backgroundOpacity,
    backgroundImage,
    isProcessing, 
    setProcessedImages, 
    setIsProcessing,
    setBatchProgress,
    setTotalItemsToProcess,
    setProcessedItemsCount,
    // Multi-format options
    outputFormat,
    compressionSettings,
    stripMetadata,
    progressiveLoading,
    // Resize options
    resizeMode,
    resizeUnit,
    resizeQuality
  ]);
  
  const downloadImageAction = useCallback((index: number) => {
    downloadImageUtil(index, processedImages);
    
    // Also save to Google Drive when downloading
    const img = processedImages[index];
    if (img.processed && img.productId) {
      const productFolder = getProductFolderPath(img.productId);
      saveFileToDrive(img.processed, productFolder);
    }
  }, [processedImages]);
  
  const downloadAllImagesAction = useCallback(() => {
    downloadAllImagesUtil(processedImages);
    
    // Also save all to Google Drive
    processedImages.forEach(img => {
      if (img.processed && img.productId) {
        const productFolder = getProductFolderPath(img.productId);
        saveFileToDrive(img.processed, productFolder);
      }
    });
  }, [processedImages]);
  
  // Function to generate HTML snippet for WordPress
  const generateHtmlSnippet = (image: ProcessedImage, productId: string): string => {
    // Simple HTML snippet for now - could be more complex based on formats, etc.
    return `<!-- WordPress Image HTML for ${productId} -->
<figure class="wp-block-image">
  <img src="${PROCESSED_IMAGES_PATH}\\${productId}\\${image.newFilename || image.original.name}" 
       alt="${image.newFilename || image.original.name}"
       width="${image.processedDimensions?.width || image.dimensions?.width || '800'}" 
       height="${image.processedDimensions?.height || image.dimensions?.height || '600'}" />
  <figcaption>Product image</figcaption>
</figure>`;
  };
  
  // New actions for multi-format downloads
  const downloadImageFormatAction = useCallback((index: number, format: string) => {
    downloadFormatUtil(index, format, processedImages);
    
    // Also save to Google Drive
    const img = processedImages[index];
    if (img.processedFormats?.[format] && img.productId) {
      const productFolder = getProductFolderPath(img.productId);
      saveFileToDrive(img.processedFormats[format], productFolder);
    }
  }, [processedImages]);
  
  const downloadAllFormatsAction = useCallback((index: number) => {
    downloadAllFormatsUtil(index, processedImages);
    
    // Also save all formats to Google Drive
    const img = processedImages[index];
    if (img.processedFormats && img.productId) {
      const productFolder = getProductFolderPath(img.productId);
      Object.values(img.processedFormats).forEach(formatFile => {
        saveFileToDrive(formatFile, productFolder);
      });
    }
  }, [processedImages]);
  
  return {
    processImage,
    processAllImages: processAllImagesAction,
    downloadImage: downloadImageAction,
    downloadAllImages: downloadAllImagesAction,
    cancelBatchProcessing: handleCancelBatchProcessing,
    // New multi-format actions
    downloadImageFormat: downloadImageFormatAction,
    downloadAllFormats: downloadAllFormatsAction,
  };
}
