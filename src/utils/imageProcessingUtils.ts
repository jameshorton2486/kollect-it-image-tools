
import { toast } from '@/components/ui/use-toast';
import { compressImage, createObjectUrl, downloadFile } from '@/utils/imageUtils';
import { removeImageBackground } from '@/utils/backgroundRemovalApi';
import { ProcessedImage } from '@/types/imageProcessing';
import type { CompressionOptions } from '@/utils/imageUtils';

export async function processSingleImage(
  image: ProcessedImage,
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackground: boolean,
  apiKey: string | null,
  selfHosted: boolean = false,
  serverUrl: string = ''
): Promise<ProcessedImage | null> {
  try {
    let processedFile = image.original;
    let hasBackgroundRemoved = false;
    
    // Step 1: Remove background if enabled
    if (removeBackground) {
      const bgRemovalResult = await removeImageBackground(image.original, apiKey, selfHosted, serverUrl);
      
      if (bgRemovalResult.processedFile) {
        processedFile = bgRemovalResult.processedFile;
        hasBackgroundRemoved = true;
      } else {
        // If background removal failed but we want to continue with compression
        toast({
          title: "Background Removal Failed",
          description: "Proceeding with compression only"
        });
      }
    }
    
    // Step 2: Compress the image (either original or background-removed)
    const compressionOptions: CompressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      initialQuality: compressionLevel / 100,
    };
    
    const compressedFile = await compressImage(processedFile, compressionOptions);
    
    if (compressedFile) {
      const previewUrl = createObjectUrl(compressedFile);
      
      return {
        ...image,
        processed: compressedFile,
        preview: previewUrl,
        isProcessing: false,
        hasBackgroundRemoved,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error processing image:", error);
    toast({
      variant: "destructive",
      title: "Processing Failed",
      description: `Failed to process ${image.original.name}`
    });
    
    return null;
  }
}

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
  
  toast({
    title: "Download Complete",
    description: `Downloaded ${image.original.name}`
  });
}
