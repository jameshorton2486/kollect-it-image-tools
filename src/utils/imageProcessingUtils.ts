
import { toast } from '@/components/ui/use-toast';
import { compressImage, createObjectUrl, downloadFile } from '@/utils/imageUtils';
import { removeImageBackground } from '@/utils/backgroundRemovalApi';
import { ProcessedImage } from '@/types/imageProcessing';
import type { CompressionOptions } from '@/utils/imageUtils';
import { 
  generateCacheKey, 
  getProcessedImageFromCache, 
  cacheProcessedImage 
} from '@/utils/imageCacheUtils';
import { retryOperation } from '@/utils/retryUtils';

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
    // Generate cache key based on image and processing parameters
    const cacheKey = generateCacheKey(
      image.original,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground
    );
    
    // Check if the image is in cache
    const cachedImage = await getProcessedImageFromCache(cacheKey);
    
    if (cachedImage) {
      console.log('Using cached image for', image.original.name);
      const previewUrl = createObjectUrl(cachedImage);
      
      return {
        ...image,
        processed: cachedImage,
        preview: previewUrl,
        isProcessing: false,
        hasBackgroundRemoved: removeBackground, // Assume the cached version has background removed if requested
      };
    }
    
    // Not in cache, process the image
    console.log('Processing image', image.original.name);
    let processedFile = image.original;
    let hasBackgroundRemoved = false;
    
    // Step 1: Remove background if enabled
    if (removeBackground) {
      // Use retry for background removal
      try {
        const bgRemovalResult = await retryOperation(
          () => removeImageBackground(image.original, apiKey, selfHosted, serverUrl),
          {
            maxRetries: 3,
            delayMs: 1000,
            onRetry: (attempt, error) => {
              console.log(`Retrying background removal (attempt ${attempt}/3) for ${image.original.name}: ${error.message}`);
              toast({
                title: "Retrying Background Removal",
                description: `Attempt ${attempt}/3 for ${image.original.name}`
              });
            }
          }
        );
        
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
      } catch (error) {
        // All retries failed
        console.error("All background removal attempts failed:", error);
        toast({
          variant: "destructive", 
          title: "Background Removal Failed",
          description: "All retry attempts failed. Proceeding with compression only."
        });
      }
    }
    
    // Step 2: Compress the image (either original or background-removed)
    try {
      const compressionOptions: CompressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        initialQuality: compressionLevel / 100,
      };
      
      // Use retry for compression
      const compressedFile = await retryOperation(
        () => compressImage(processedFile, compressionOptions),
        {
          maxRetries: 2,
          delayMs: 800,
          onRetry: (attempt) => {
            console.log(`Retrying compression (attempt ${attempt}/2) for ${image.original.name}`);
            toast({
              title: "Retrying Compression",
              description: `Attempt ${attempt}/2 for ${image.original.name}`
            });
          }
        }
      );
      
      if (compressedFile) {
        const previewUrl = createObjectUrl(compressedFile);
        
        // Store processed result in cache
        cacheProcessedImage(cacheKey, compressedFile, image.original.name);
        
        return {
          ...image,
          processed: compressedFile,
          preview: previewUrl,
          isProcessing: false,
          hasBackgroundRemoved,
        };
      }
    } catch (error) {
      console.error("All compression attempts failed:", error);
      toast({
        variant: "destructive",
        title: "Compression Failed",
        description: `All retry attempts failed for ${image.original.name}`
      });
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
