
import { toast } from 'sonner';
import { ProcessedImage } from "@/types/imageProcessing";
import { downloadProcessedImage } from '@/utils/imageProcessingUtils';

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
    toast.error("No processed images to download");
    return;
  }
  
  // Track bulk download event
  console.log('Tracking bulk download event', selectedImages.length);
  
  selectedImages.forEach((image, index) => {
    setTimeout(() => {
      if (image.processed) {
        downloadProcessedImage(image);
      }
    }, index * 100); // Stagger downloads slightly
  });
  
  toast.success(`Downloading ${selectedImages.length} images`);
}
