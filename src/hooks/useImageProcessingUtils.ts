
import { toast } from '@/components/ui/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { 
  processSingleImage, 
  downloadProcessedImage 
} from '@/utils/imageProcessingUtils';

export async function processImageUtil(
  index: number,
  processedImages: ProcessedImage[],
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackground: boolean,
  apiKey: string | null,
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>
): Promise<void> {
  const image = processedImages[index];
  if (!image || image.isProcessing) return;
  
  const updatedImages = [...processedImages];
  updatedImages[index].isProcessing = true;
  setProcessedImages(updatedImages);
  
  try {
    const processedImage = await processSingleImage(
      image,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      apiKey
    );
    
    if (processedImage) {
      updatedImages[index] = processedImage;
      setProcessedImages(updatedImages);
      
      toast({
        title: "Success",
        description: `Processed ${image.original.name}${processedImage.hasBackgroundRemoved ? ' with background removal' : ''}`
      });
    } else {
      updatedImages[index].isProcessing = false;
      setProcessedImages(updatedImages);
    }
  } catch (error) {
    console.error("Error in processImage:", error);
    updatedImages[index].isProcessing = false;
    setProcessedImages(updatedImages);
  }
}

export async function processAllImagesUtil(
  processedImages: ProcessedImage[],
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackground: boolean,
  apiKey: string | null,
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
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
    
    for (let i = 0; i < processedImages.length; i++) {
      if (processedImages[i].isSelected) {
        await processImageUtil(
          i,
          processedImages,
          compressionLevel,
          maxWidth,
          maxHeight,
          removeBackground,
          apiKey,
          setProcessedImages
        );
      }
    }
    
    toast({
      title: "Batch Processing Complete",
      description: "All selected images processed successfully!"
    });
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
