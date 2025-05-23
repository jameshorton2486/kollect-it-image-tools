
import { toast } from 'sonner';
import { ProcessedImage, ImageProcessingSettings } from "@/types/imageProcessing";
import { processSingleImage } from '@/utils/imageProcessingUtils';
import { createObjectUrl } from '@/utils/imageUtils';
import { 
  startMeasuring, 
  endMeasuring, 
  getOptimalProcessingSettings, 
  categorizeResolution,
  getProcessingOptimizations 
} from '@/utils/performance';
import { logger, handleError } from '@/utils/logging';

export async function processImageUtil(
  index: number,
  processedImages: ProcessedImage[],
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackground: boolean,
  apiKey: string | null,
  selfHosted: boolean,
  serverUrl: string,
  backgroundRemovalModel: string,
  backgroundType: string = 'none',
  backgroundColor: string = '#FFFFFF',
  backgroundOpacity: number = 100,
  backgroundImage: File | null = null,
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>
): Promise<void> {
  const image = processedImages[index];
  if (!image || image.isProcessing) return;
  
  const updatedImages = [...processedImages];
  updatedImages[index].isProcessing = true;
  updatedImages[index].processingProgress = 0;
  updatedImages[index].retryCount = 0;
  setProcessedImages(updatedImages);
  
  const startTime = Date.now();
  const maxProcessingTime = 30000;
  let timeoutId: number | undefined;
  
  try {
    logger.info(`Starting processing for image ${index}: ${image.original.name}`, {
      module: 'ImageProcessing',
      data: {
        fileSize: image.original.size,
        fileName: image.original.name,
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        backgroundRemovalModel: removeBackground ? backgroundRemovalModel : 'none'
      }
    });
    
    timeoutId = window.setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      logger.error(`Processing timeout for image ${image.original.name}`, {
        module: 'ImageProcessing',
        data: { elapsedTime }
      });
      
      setProcessedImages(current => {
        const updated = [...current];
        if (updated[index]) {
          updated[index].isProcessing = false;
          updated[index].processingProgress = undefined;
          updated[index].processingError = `Processing timed out after ${Math.round(elapsedTime / 1000)} seconds`;
        }
        return updated;
      });
      
      toast.error(`The image "${image.original.name}" took too long to process`);
    }, maxProcessingTime);
    
    const imageWidth = image.dimensions?.width || 0;
    const imageHeight = image.dimensions?.height || 0;
    const resolutionCategory = imageWidth && imageHeight ? 
      categorizeResolution(imageWidth, imageHeight) : 'mediumRes';
    
    const originalSize = image.original.size;
    const imageResolution = image.dimensions ? 
      `${image.dimensions.width}x${image.dimensions.height}` : 
      'unknown dimensions';
    
    const perfMeasurement = startMeasuring(
      `image-processing${removeBackground ? '-with-bg-removal' : ''}`,
      originalSize,
      imageResolution
    );
    
    const optimalSettings = getOptimalProcessingSettings(imageWidth, imageHeight);
    
    const processingOptimizations = imageWidth && imageHeight ?
      getProcessingOptimizations(image.original, imageWidth, imageHeight) :
      null;
    
    if (processingOptimizations?.shouldDownsampleFirst) {
      logger.info(`Large image detected (${imageResolution}), applying optimization strategies`, {
        module: 'ImageProcessing'
      });
    }
    
    const progressUpdater = setInterval(() => {
      setProcessedImages(current => {
        const updated = [...current];
        if (updated[index]?.isProcessing && updated[index].processingProgress! < 90) {
          updated[index].processingProgress = Math.min(90, (updated[index].processingProgress || 0) + 5);
          return updated;
        }
        return current;
      });
    }, 300);
    
    if (backgroundRemovalModel === 'rembg' && !selfHosted) {
      logger.warn("Rembg server not available, falling back to browser model", {
        module: 'ImageProcessing'
      });
      
      toast.error("Rembg Server Not Available. Switching to browser-based background removal as fallback.");
      backgroundRemovalModel = 'browser';
    }
    
    if (optimalSettings.useDownsampling) {
      toast.info(`Optimizing processing for ${imageResolution} image.`);
    }
    
    // Create processing settings object
    const settings: ImageProcessingSettings = {
      maxWidth,
      maxHeight,
      quality: compressionLevel,
      format: 'jpeg',
      preserveAspectRatio: true,
      stripMetadata: true,
      progressiveLoading: true,
      removeBackground,
      resizeMode: 'fit',
      resizeQuality: 80,
      compressionLevel,
      backgroundType,
      backgroundColor,
      backgroundOpacity,
      backgroundImage
    };
    
    const processedResult = await processSingleImage(image.original, settings).catch(error => {
      logger.error(`Error processing image: ${error instanceof Error ? error.message : String(error)}`, {
        module: 'ImageProcessing',
        data: { error }
      });
      return null;
    });
    
    clearInterval(progressUpdater);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    
    endMeasuring(perfMeasurement);
    
    if (processedResult) {
      logger.info(`Successfully processed image ${image.original.name}`, {
        module: 'ImageProcessing',
        data: {
          originalSize: image.original.size,
          processedSize: processedResult.processed ? processedResult.processed.size : 0,
          compressionRatio: processedResult.averageCompressionRate,
          processingTime: perfMeasurement.endTime! - perfMeasurement.startTime
        }
      });
      
      updatedImages[index] = processedResult;
      updatedImages[index].isProcessing = false;
      updatedImages[index].processingProgress = 100;
      updatedImages[index].hasBackgroundRemoved = removeBackground;
      updatedImages[index].processingError = undefined;
      setProcessedImages(updatedImages);
      
      toast.success(`Processed ${image.original.name}${removeBackground ? ` with ${backgroundRemovalModel} background removal` : ''}`);
    } else {
      logger.error(`Failed to process image ${image.original.name}`, {
        module: 'ImageProcessing'
      });
      
      updatedImages[index].isProcessing = false;
      updatedImages[index].processingProgress = undefined;
      updatedImages[index].processingError = "Processing failed";
      setProcessedImages(updatedImages);
      
      toast.error(`Failed to process ${image.original.name}`);
    }
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    handleError(error, `Error processing image ${image?.original?.name || 'unknown'}`, false);
    
    toast.error(error instanceof Error ? error.message : "An unknown error occurred");
    
    const updatedErrorImages = [...processedImages];
    updatedErrorImages[index].isProcessing = false;
    updatedErrorImages[index].processingProgress = undefined;
    updatedErrorImages[index].processingError = error instanceof Error ? error.message : "Unknown error";
    setProcessedImages(updatedErrorImages);
  }
}
