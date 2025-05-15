
import { toast } from '@/components/ui/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { 
  processSingleImage, 
  downloadProcessedImage 
} from '@/utils/imageProcessingUtils';
import { retryOperation } from '@/utils/retryUtils';

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
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>
): Promise<void> {
  const image = processedImages[index];
  if (!image || image.isProcessing) return;
  
  const updatedImages = [...processedImages];
  updatedImages[index].isProcessing = true;
  updatedImages[index].processingProgress = 0; // Initialize progress
  updatedImages[index].retryCount = 0; // Reset retry count
  setProcessedImages(updatedImages);
  
  try {
    // Update progress in steps to show activity
    const progressUpdater = setInterval(() => {
      setProcessedImages(current => {
        const updated = [...current];
        // If still processing, increase progress by small amounts
        if (updated[index].isProcessing && updated[index].processingProgress! < 90) {
          updated[index].processingProgress = Math.min(90, (updated[index].processingProgress || 0) + 5);
          return updated;
        }
        return current;
      });
    }, 300);
    
    // Process with automatic retry
    const processedImage = await processSingleImage(
      image,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      apiKey,
      selfHosted,
      serverUrl
    );
    
    clearInterval(progressUpdater);
    
    if (processedImage) {
      processedImage.processingProgress = 100; // Mark as complete
      processedImage.retryCount = updatedImages[index].retryCount || 0; // Preserve retry count
      updatedImages[index] = processedImage;
      setProcessedImages(updatedImages);
      
      toast({
        title: "Success",
        description: `Processed ${image.original.name}${processedImage.hasBackgroundRemoved ? ' with background removal' : ''}${
          processedImage.retryCount ? ` after ${processedImage.retryCount} retries` : ''
        }`
      });
    } else {
      updatedImages[index].isProcessing = false;
      updatedImages[index].processingProgress = undefined; // Reset progress on failure
      setProcessedImages(updatedImages);
    }
  } catch (error) {
    console.error("Error in processImage:", error);
    updatedImages[index].isProcessing = false;
    updatedImages[index].processingProgress = undefined; // Reset progress on failure
    setProcessedImages(updatedImages);
  }
}

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
    
    batchProcessingCancelled = false;
    setTotalItemsToProcess(selectedImages.length);
    setProcessedItemsCount(0);
    setBatchProgress(0);
    
    let processedCount = 0;
    let failedCount = 0;
    let retriedCount = 0;
    
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
  }
}

export function downloadImageUtil(
  index: number,
  processedImages: ProcessedImage[]
): void {
  const image = processedImages[index];
  if (!image || !image.processed) return;
  
  downloadProcessedImage(image);
}

export function downloadAllImagesUtil(
  processedImages: ProcessedImage[]
): void {
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
}
