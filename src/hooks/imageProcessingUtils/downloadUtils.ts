
import { toast } from '@/hooks/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { downloadProcessedImage } from '@/utils/imageProcessingUtils';
import { trackEvent } from '@/utils/analyticsUtils';

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
  
  // Track bulk download event
  trackEvent('download', {
    bulk: true,
    count: selectedImages.length,
    totalSize: selectedImages.reduce((sum, img) => sum + (img.processed?.size || 0), 0)
  });
  
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
