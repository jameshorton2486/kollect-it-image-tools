
import { toast } from '@/components/ui/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { processSingleImage } from '@/utils/imageProcessingUtils';
import { createObjectUrl } from '@/utils/imageUtils';
import { startMeasuring, endMeasuring } from '@/utils/performanceUtils';

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
    // Start performance measurement
    const originalSize = image.original.size;
    const imageResolution = `${image.original.width || '?'}x${image.original.height || '?'}`;
    
    const perfMeasurement = startMeasuring(
      `image-processing${removeBackground ? '-with-bg-removal' : ''}`,
      originalSize,
      imageResolution
    );
    
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
    
    // If Rembg is selected but selfHosted is false, warn and switch to browser mode
    if (backgroundRemovalModel === 'rembg' && !selfHosted) {
      toast({
        title: "Rembg Server Not Available",
        description: "Switching to browser-based background removal as fallback.",
        variant: "destructive"
      });
      
      // Use browser model as fallback
      backgroundRemovalModel = 'browser';
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
      backgroundOpacity
    );
    
    clearInterval(progressUpdater);
    
    // Complete performance measurement
    endMeasuring(perfMeasurement);
    
    if (processedResult) {
      updatedImages[index].processed = processedResult;
      // Create a new preview URL for the processed image
      updatedImages[index].preview = createObjectUrl(processedResult);
      updatedImages[index].isProcessing = false;
      updatedImages[index].processingProgress = 100; // Mark as complete
      updatedImages[index].hasBackgroundRemoved = removeBackground;
      setProcessedImages(updatedImages);
      
      toast({
        title: "Success",
        description: `Processed ${image.original.name}${removeBackground ? ` with ${backgroundRemovalModel} background removal` : ''}${
          updatedImages[index].retryCount ? ` after ${updatedImages[index].retryCount} retries` : ''
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
