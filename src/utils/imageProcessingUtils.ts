
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
import { trackEvent, recordCompressionStats } from '@/utils/analyticsUtils';

export async function processSingleImage(
  image: ProcessedImage,
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackground: boolean,
  apiKey: string | null,
  selfHosted: boolean = false,
  serverUrl: string = '',
  backgroundRemovalModel: string = 'removebg'
): Promise<ProcessedImage | null> {
  try {
    const processingStartTime = performance.now();
    
    // Generate cache key based on image and processing parameters
    const cacheKey = generateCacheKey(
      image.original,
      compressionLevel,
      maxWidth,
      maxHeight,
      removeBackground,
      backgroundRemovalModel // Include model in cache key
    );
    
    // Check if the image is in cache
    const cachedImage = await getProcessedImageFromCache(cacheKey);
    
    if (cachedImage) {
      console.log('Using cached image for', image.original.name);
      const previewUrl = createObjectUrl(cachedImage);
      
      // Track cache hit
      trackEvent('process', {
        cached: true,
        imageName: image.original.name,
        imageSize: image.original.size,
        model: backgroundRemovalModel
      });
      
      return {
        ...image,
        processed: cachedImage,
        preview: previewUrl,
        isProcessing: false,
        hasBackgroundRemoved: removeBackground,
      };
    }
    
    // Not in cache, process the image
    console.log('Processing image', image.original.name);
    let processedFile = image.original;
    let hasBackgroundRemoved = false;
    const originalSize = image.original.size;
    
    // Step 1: Remove background if enabled
    if (removeBackground) {
      // Use retry for background removal
      try {
        const bgRemovalStartTime = performance.now();
        
        const bgRemovalResult = await retryOperation(
          () => removeImageBackground(
            image.original, 
            apiKey, 
            selfHosted, 
            serverUrl,
            backgroundRemovalModel
          ),
          {
            maxRetries: 3,
            delayMs: 1000,
            onRetry: (attempt, error) => {
              console.log(`Retrying background removal with ${backgroundRemovalModel} (attempt ${attempt}/3) for ${image.original.name}: ${error.message}`);
              toast({
                title: `Retrying ${backgroundRemovalModel} Background Removal`,
                description: `Attempt ${attempt}/3 for ${image.original.name}`
              });
            }
          }
        );
        
        const bgRemovalEndTime = performance.now();
        
        if (bgRemovalResult.processedFile) {
          processedFile = bgRemovalResult.processedFile;
          hasBackgroundRemoved = true;
          
          // Track successful background removal
          trackEvent('background_removal', {
            success: true,
            imageName: image.original.name,
            processingTime: bgRemovalEndTime - bgRemovalStartTime,
            model: backgroundRemovalModel
          });
        } else {
          // If background removal failed but we want to continue with compression
          toast({
            title: "Background Removal Failed",
            description: "Proceeding with compression only"
          });
          
          // Track failed background removal
          trackEvent('background_removal', {
            success: false,
            imageName: image.original.name,
            error: 'Background removal failed',
            model: backgroundRemovalModel
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
        
        // Track failed background removal after all retries
        trackEvent('background_removal', {
          success: false,
          imageName: image.original.name,
          error: 'All retry attempts failed',
          model: backgroundRemovalModel
        });
      }
    }
    
    // Step 2: Compress the image (either original or background-removed)
    try {
      const compressionStartTime = performance.now();
      
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
        
        const processingEndTime = performance.now();
        const processingTime = processingEndTime - processingStartTime;
        
        // Record compression statistics
        recordCompressionStats({
          originalSize,
          processedSize: compressedFile.size,
          compressionRatio: 1 - (compressedFile.size / originalSize),
          processingTime,
        });
        
        // Track successful image processing
        trackEvent('process', {
          success: true,
          imageName: image.original.name,
          originalSize,
          processedSize: compressedFile.size,
          compressionRatio: 1 - (compressedFile.size / originalSize),
          hasBackgroundRemoved,
          processingTime,
        });
        
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
      
      // Track failed compression
      trackEvent('process', {
        success: false,
        imageName: image.original.name,
        error: 'Compression failed after all retries',
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
    
    // Track general processing error
    trackEvent('process', {
      success: false,
      imageName: image.original.name,
      error: String(error),
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
