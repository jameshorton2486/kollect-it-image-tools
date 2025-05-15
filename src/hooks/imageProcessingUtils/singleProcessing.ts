
import { toast } from '@/hooks/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { processSingleImage } from '@/utils/imageProcessingUtils';

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
      serverUrl,
      backgroundRemovalModel
    );
    
    clearInterval(progressUpdater);
    
    if (processedImage) {
      processedImage.processingProgress = 100; // Mark as complete
      processedImage.retryCount = updatedImages[index].retryCount || 0; // Preserve retry count
      updatedImages[index] = processedImage;
      setProcessedImages(updatedImages);
      
      toast({
        title: "Success",
        description: `Processed ${image.original.name}${processedImage.hasBackgroundRemoved ? ` with ${backgroundRemovalModel} background removal` : ''}${
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
