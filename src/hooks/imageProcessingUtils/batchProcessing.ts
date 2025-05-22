import { toast } from '@/hooks/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { trackEvent } from '@/utils/analyticsUtils';
import { processImageUtil } from './singleProcessing';
import { startMeasuring, endMeasuring, getOptimalProcessingSettings } from '@/utils/performanceUtils';
import { logger, handleError } from '@/utils/logging';

// Keep a reference to the cancellation flag
let batchProcessingCancelled = false;
// Keep reference to active batch ID to prevent overlap
let activeBatchId: string | null = null;

export function cancelBatchProcessing() {
  if (activeBatchId) {
    logger.info(`Cancelling batch processing: ${activeBatchId}`, { 
      module: 'BatchProcessing' 
    });
    batchProcessingCancelled = true;
  }
}

export async function processAllImagesUtil(
  processedImages: ProcessedImage[],
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackground: boolean,
  apiKey: string | null,
  selfHosted: boolean,
  serverUrl: string,
  backgroundRemovalModel: string,
  backgroundType: string,
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundImage: File | null,
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setBatchProgress: React.Dispatch<React.SetStateAction<number>>,
  setTotalItemsToProcess: React.Dispatch<React.SetStateAction<number>>,
  setProcessedItemsCount: React.Dispatch<React.SetStateAction<number>>
): Promise<void> {
  // Generate a unique batch ID
  const batchId = `batch_${Date.now()}`;
  activeBatchId = batchId;
  
  try {
    const selectedImages = processedImages.filter(img => img.isSelected);
    
    if (selectedImages.length === 0) {
      logger.warn("Batch processing called with no selected images", { 
        module: 'BatchProcessing' 
      });
      
      toast({
        title: "No Images Selected",
        description: "No images selected for processing"
      });
      return;
    }
    
    // Log batch processing start
    logger.info(`Starting batch processing of ${selectedImages.length} images`, {
      module: 'BatchProcessing',
      data: {
        batchId,
        imageCount: selectedImages.length,
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground,
        backgroundRemovalModel: removeBackground ? backgroundRemovalModel : 'none'
      }
    });
    
    // Get optimal processing settings based on device capabilities
    const optimalSettings = getOptimalProcessingSettings();
    
    // Start performance measurement
    const batchPerfMeasurement = startMeasuring(
      'batch-processing', 
      undefined, 
      `${selectedImages.length} images`
    );
    
    batchProcessingCancelled = false;
    setTotalItemsToProcess(selectedImages.length);
    setProcessedItemsCount(0);
    setBatchProgress(0);
    
    let processedCount = 0;
    let failedCount = 0;
    let retriedCount = 0;
    const errors: {index: number, message: string}[] = [];
    
    // Track batch processing start
    trackEvent('batch_process', {
      started: true,
      totalImages: selectedImages.length,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      model: removeBackground ? backgroundRemovalModel : 'none',
      backgroundType: removeBackground ? backgroundType : 'none'
    });
    
    // Process images in batches to prevent overwhelming system resources
    const maxConcurrent = optimalSettings.maxConcurrentProcessing;
    const selectedIndices = processedImages
      .map((img, idx) => img.isSelected ? idx : -1)
      .filter(idx => idx !== -1);
    
    // Process in batches based on device capabilities
    for (let i = 0; i < selectedIndices.length && !batchProcessingCancelled && activeBatchId === batchId; i += maxConcurrent) {
      const batch = selectedIndices.slice(i, i + maxConcurrent);
      logger.info(`Processing batch ${Math.floor(i/maxConcurrent) + 1} of ${Math.ceil(selectedIndices.length/maxConcurrent)}`, { 
        module: 'BatchProcessing',
        data: { batchSize: batch.length }
      });
      
      // Process this batch concurrently
      await Promise.allSettled(batch.map(async (idx) => {
        try {
          await processImageUtil(
            idx,
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
            setProcessedImages
          );
          
          // Check if the image was successfully processed
          const latestImages = processedImages[idx];
          
          if (latestImages.retryCount && latestImages.retryCount > 0) {
            retriedCount++;
            logger.info(`Image at index ${idx} was processed after ${latestImages.retryCount} retries`, {
              module: 'BatchProcessing'
            });
          }
          
          if (latestImages.processed) {
            processedCount++;
          } else {
            failedCount++;
            errors.push({
              index: idx, 
              message: latestImages.processingError || "Unknown error"
            });
            logger.error(`Failed to process image at index ${idx}`, {
              module: 'BatchProcessing',
              data: { error: latestImages.processingError }
            });
          }
        } catch (error) {
          failedCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push({index: idx, message: errorMessage});
          handleError(error, `Batch processing error for image at index ${idx}`, false);
        }
        
        setProcessedItemsCount(processedCount);
        setBatchProgress(Math.round((processedCount / selectedImages.length) * 100));
      }));
      
      // Small delay between batches to let the UI update
      if (i + maxConcurrent < selectedIndices.length && !batchProcessingCancelled) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Complete performance measurement
    endMeasuring(batchPerfMeasurement);
    
    // Log batch processing completion
    logger.info(`Batch processing completed: ${processedCount}/${selectedImages.length} images processed successfully`, {
      module: 'BatchProcessing',
      data: {
        batchId,
        processedCount,
        failedCount,
        retriedCount,
        processingTime: batchPerfMeasurement.endTime! - batchPerfMeasurement.startTime,
        cancelled: batchProcessingCancelled
      }
    });
    
    // Log errors if any
    if (errors.length > 0) {
      logger.error(`Batch processing had ${errors.length} errors`, {
        module: 'BatchProcessing',
        data: { errors }
      });
    }
    
    // Track batch processing completion
    trackEvent('batch_process', {
      completed: true,
      totalImages: selectedImages.length,
      processedCount,
      failedCount,
      retriedCount,
      processingTime: batchPerfMeasurement.endTime! - batchPerfMeasurement.startTime,
      cancelled: batchProcessingCancelled,
      model: removeBackground ? backgroundRemovalModel : 'none',
      backgroundType: removeBackground ? backgroundType : 'none'
    });
    
    if (batchProcessingCancelled) {
      toast({
        title: "Processing Cancelled",
        description: `Processed ${processedCount} of ${selectedImages.length} images` + 
                    (failedCount > 0 ? ` (${failedCount} failed)` : "")
      });
    } else {
      toast({
        title: "Batch Processing Complete",
        description: `Successfully processed ${processedCount} images` + 
                    (failedCount > 0 ? `, ${failedCount} failed` : "") +
                    (retriedCount > 0 ? `, ${retriedCount} recovered via retry` : "")
      });
      
      // If there were failures but some successes, offer guidance
      if (failedCount > 0 && processedCount > 0) {
        setTimeout(() => {
          toast({
            title: "Processing Issues",
            description: "Some images couldn't be processed. Try adjusting settings or using a different background removal model.",
            duration: 6000
          });
        }, 1000);
      }
    }
  } catch (error) {
    handleError(error, "Error in batch processing", true);
    
    // Track batch processing error
    trackEvent('batch_process', {
      error: String(error)
    });
  } finally {
    // Reset flags and variables
    if (activeBatchId === batchId) {
      activeBatchId = null;
      batchProcessingCancelled = false;
    }
  }
}
