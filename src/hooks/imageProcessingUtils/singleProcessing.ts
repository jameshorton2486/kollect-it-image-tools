
import { toast } from '@/components/ui/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
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
  updatedImages[index].processingProgress = 0; // Initialize progress
  updatedImages[index].retryCount = 0; // Reset retry count
  setProcessedImages(updatedImages);
  
  // Track start of processing for timeout monitoring
  const startTime = Date.now();
  const maxProcessingTime = 30000; // 30 seconds timeout
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
    
    // Set timeout to prevent infinite processing
    timeoutId = window.setTimeout(() => {
      const elapsedTime = Date.now() - startTime;
      logger.error(`Processing timeout for image ${image.original.name}`, {
        module: 'ImageProcessing',
        data: { elapsedTime }
      });
      
      // Reset processing state
      setProcessedImages(current => {
        const updated = [...current];
        if (updated[index]) {
          updated[index].isProcessing = false;
          updated[index].processingProgress = undefined;
          updated[index].processingError = `Processing timed out after ${Math.round(elapsedTime / 1000)} seconds`;
        }
        return updated;
      });
      
      toast({
        variant: "destructive",
        title: "Processing Timed Out",
        description: `The image "${image.original.name}" took too long to process`
      });
    }, maxProcessingTime);
    
    // Get image dimensions if available
    const imageWidth = image.dimensions?.width || 0;
    const imageHeight = image.dimensions?.height || 0;
    const resolutionCategory = imageWidth && imageHeight ? 
      categorizeResolution(imageWidth, imageHeight) : 'mediumRes';
    
    // Start performance measurement
    const originalSize = image.original.size;
    const imageResolution = image.dimensions ? 
      `${image.dimensions.width}x${image.dimensions.height}` : 
      'unknown dimensions';
    
    const perfMeasurement = startMeasuring(
      `image-processing${removeBackground ? '-with-bg-removal' : ''}`,
      originalSize,
      imageResolution
    );
    
    // Get optimal processing settings
    const optimalSettings = getOptimalProcessingSettings(imageWidth, imageHeight);
    
    // Get processing optimizations
    const processingOptimizations = imageWidth && imageHeight ?
      getProcessingOptimizations(image.original, imageWidth, imageHeight) :
      null;
    
    if (processingOptimizations?.shouldDownsampleFirst) {
      logger.info(`Large image detected (${imageResolution}), applying optimization strategies`, {
        module: 'ImageProcessing'
      });
    }
    
    // Update progress in steps to show activity
    const progressUpdater = setInterval(() => {
      setProcessedImages(current => {
        const updated = [...current];
        // If still processing, increase progress by small amounts
        if (updated[index]?.isProcessing && updated[index].processingProgress! < 90) {
          updated[index].processingProgress = Math.min(90, (updated[index].processingProgress || 0) + 5);
          return updated;
        }
        return current;
      });
    }, 300);
    
    // If Rembg is selected but selfHosted is false, warn and switch to browser mode
    if (backgroundRemovalModel === 'rembg' && !selfHosted) {
      logger.warn("Rembg server not available, falling back to browser model", {
        module: 'ImageProcessing'
      });
      
      toast({
        title: "Rembg Server Not Available",
        description: "Switching to browser-based background removal as fallback.",
        variant: "destructive"
      });
      
      // Use browser model as fallback
      backgroundRemovalModel = 'browser';
    }
    
    // Performance note for high-resolution images
    if (optimalSettings.useDownsampling) {
      toast({
        title: "Processing High-Resolution Image",
        description: `Optimizing processing for ${imageResolution} image.`,
      });
    }
    
    // Process with automatic retry - pass the original File from the ProcessedImage
    const processedResult = await processSingleImage(
      image.original, // Pass the File, not the whole ProcessedImage
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
      backgroundImage
    ).catch(error => {
      logger.error(`Error processing image: ${error instanceof Error ? error.message : String(error)}`, {
        module: 'ImageProcessing',
        data: { error }
      });
      return null;
    });
    
    clearInterval(progressUpdater);
    
    // Clear the timeout as processing completed
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
    
    // Complete performance measurement
    endMeasuring(perfMeasurement);
    
    if (processedResult) {
      logger.info(`Successfully processed image ${image.original.name}`, {
        module: 'ImageProcessing',
        data: {
          originalSize: image.original.size,
          processedSize: processedResult.size,
          compressionRatio: 1 - (processedResult.size / image.original.size),
          processingTime: perfMeasurement.endTime! - perfMeasurement.startTime
        }
      });
      
      updatedImages[index].processed = processedResult;
      // Create a new preview URL for the processed image
      updatedImages[index].preview = createObjectUrl(processedResult);
      updatedImages[index].isProcessing = false;
      updatedImages[index].processingProgress = 100; // Mark as complete
      updatedImages[index].hasBackgroundRemoved = removeBackground;
      updatedImages[index].processingError = undefined; // Clear any previous errors
      setProcessedImages(updatedImages);
      
      toast({
        title: "Success",
        description: `Processed ${image.original.name}${removeBackground ? ` with ${backgroundRemovalModel} background removal` : ''}${
          updatedImages[index].retryCount ? ` after ${updatedImages[index].retryCount} retries` : ''
        }`
      });
    } else {
      logger.error(`Failed to process image ${image.original.name}`, {
        module: 'ImageProcessing'
      });
      
      updatedImages[index].isProcessing = false;
      updatedImages[index].processingProgress = undefined; // Reset progress on failure
      updatedImages[index].processingError = "Processing failed"; // Add error message
      setProcessedImages(updatedImages);
      
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: `Failed to process ${image.original.name}`
      });
    }
  } catch (error) {
    // Clear the timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    handleError(error, `Error processing image ${image?.original?.name || 'unknown'}`, false);
    
    toast({
      variant: "destructive",
      title: "Processing Error",
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    
    const updatedErrorImages = [...processedImages];
    updatedErrorImages[index].isProcessing = false;
    updatedErrorImages[index].processingProgress = undefined; // Reset progress on failure
    updatedErrorImages[index].processingError = error instanceof Error ? error.message : "Unknown error"; // Add error message
    setProcessedImages(updatedErrorImages);
  }
}
