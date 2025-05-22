
import { toast } from '@/hooks/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { trackEvent } from '@/utils/analyticsUtils';
import { processImageUtil } from './singleProcessing';
import { startMeasuring, endMeasuring, getOptimalProcessingSettings } from '@/utils/performanceUtils';

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
  try {
    const selectedImages = processedImages.filter(img => img.isSelected);
    
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "No images selected for processing"
      });
      return;
    }
    
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
    for (let i = 0; i < selectedIndices.length && !batchProcessingCancelled; i += maxConcurrent) {
      const batch = selectedIndices.slice(i, i + maxConcurrent);
      
      // Process this batch concurrently
      await Promise.all(batch.map(async (idx) => {
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
        }
        
        if (latestImages.processed) {
          processedCount++;
        } else {
          failedCount++;
        }
        
        setProcessedItemsCount(processedCount);
        setBatchProgress(Math.round((processedCount / selectedImages.length) * 100));
      }));
      
      // Small delay between batches to let the UI update
      if (i + maxConcurrent < selectedIndices.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Complete performance measurement
    endMeasuring(batchPerfMeasurement);
    
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
