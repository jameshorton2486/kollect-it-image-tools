
import { toast } from '@/components/ui/use-toast';
import { createObjectUrl, downloadFile } from '@/utils/imageUtils';
import { ProcessedImage } from '@/types/imageProcessing';
import { trackEvent } from '@/utils/analyticsUtils';

export function initializeProcessedImages(files: File[]): ProcessedImage[] {
  return files.map(file => ({
    original: file,
    processed: null,
    preview: createObjectUrl(file),
    isProcessing: false,
    isSelected: true,
    hasBackgroundRemoved: false,
  }));
}

export function downloadProcessedImage(image: ProcessedImage): void {
  if (!image.processed) return;
  
  downloadFile(image.processed, `optimized-${image.original.name}`);
  
  // Track download event
  trackEvent('download', {
    imageName: image.original.name,
    fileSize: image.processed.size
  });
  
  toast({
    title: "Download Complete",
    description: `Downloaded ${image.original.name}`
  });
}
