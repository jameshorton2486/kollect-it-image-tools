import { toast } from '@/hooks/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { trackEvent } from '@/utils/analyticsUtils';
import { processImageUtil } from './singleProcessing';

// Keep a reference to the cancellation flag
let batchProcessingCancelled = false;

export function cancelBatchProcessing() {
  batchProcessingCancelled = true;
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
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setBatchProgress: React.Dispatch<React.SetStateAction<number>>,
  setTotalItemsToProcess: React.Dispatch<React.SetStateAction<number>>,
  setProcessedItemsCount: React.Dispatch<React.SetStateAction<number>>
): Promise<void> {
  try {
    const selectedImages = processedImages.filter(img => img.isSelected);
    
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "No images selected for processing"
      });
      return;
    }
    
    const batchProcessingStartTime = performance.now();
    
    batchProcessingCancelled = false;
    setTotalItemsToProcess(selectedImages.length);
    setProcessedItemsCount(0);
    setBatchProgress(0);
    
    let processedCount = 0;
    let failedCount = 0;
    let retriedCount = 0;
    
    // Track batch processing start
    trackEvent('batch_process', {
      started: true,
      totalImages: selectedImages.length,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      model: removeBackground ? backgroundRemovalModel : 'none'
    });
    
    // Process images with a small delay between each to prevent overwhelming the server
    for (let i = 0; i < processedImages.length && !batchProcessingCancelled; i++) {
      if (processedImages[i].isSelected) {
        await processImageUtil(
          i,
          processedImages,
          compressionLevel,
          maxWidth,
          maxHeight,
          removeBackground,
          apiKey,
          selfHosted,
          serverUrl,
          backgroundRemovalModel,
          setProcessedImages
        );
        
        // Check if the image was successfully processed
        const latestImages = processedImages[i];
        
        if (latestImages.retryCount && latestImages.retryCount > 0) {
          retriedCount++;
        }
        
        if (latestImages.processed) {
          processedCount++;
        } else {
          failedCount++;
        }
        
        setProcessedItemsCount(processedCount);
        setBatchProgress(Math.round((processedCount / selectedImages.length) * 100));
        
        // Small delay between processing tasks
        if (i < processedImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    const batchProcessingEndTime = performance.now();
    const batchProcessingTime = batchProcessingEndTime - batchProcessingStartTime;
    
    // Track batch processing completion
    trackEvent('batch_process', {
      completed: true,
      totalImages: selectedImages.length,
      processedCount,
      failedCount,
      retriedCount,
      processingTime: batchProcessingTime,
      cancelled: batchProcessingCancelled,
      model: removeBackground ? backgroundRemovalModel : 'none'
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
    }
    
    // Reset cancellation flag
    batchProcessingCancelled = false;
  } catch (error) {
    console.error("Error in batch processing:", error);
    toast({
      variant: "destructive",
      title: "Batch Processing Failed",
      description: "Failed to process some images"
    });
    
    // Track batch processing error
    trackEvent('batch_process', {
      error: String(error)
    });
  }
}
