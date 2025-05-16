
import browserImageCompression from 'browser-image-compression';
import { ProcessedImage } from '@/types/imageProcessing';
import { createObjectUrl } from '@/utils/imageUtils';
import { cacheProcessedImage } from '@/utils/imageCacheUtils';
import { recordCompressionStats } from '@/utils/analyticsUtils';
import { removeImageBackground } from '@/utils/backgroundRemovalApi';

/**
 * Process a single image with the provided settings
 */
export async function processSingleImage(
  file: File,
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackgroundFlag: boolean,
  apiKey: string | null,
  selfHosted: boolean,
  serverUrl: string,
  backgroundRemovalModel: string
): Promise<File | null> {
  // Process image logic implementation
  // This would contain the actual image processing code
  try {
    const startTime = performance.now();
    
    let processedFile = file;
    
    // Step 1: Remove background if requested
    if (removeBackgroundFlag) {
      const bgRemovalResult = await removeImageBackground(
        processedFile,
        apiKey,
        selfHosted,
        serverUrl,
        backgroundRemovalModel
      );
      
      if (bgRemovalResult.processedFile) {
        processedFile = bgRemovalResult.processedFile;
      }
    }
    
    // Step 2: Compress the image
    const compressedFile = await handleCompression(
      processedFile,
      compressionLevel,
      maxWidth,
      maxHeight
    );
    
    const endTime = performance.now();
    
    // Record compression statistics
    recordCompressionStats({
      originalSize: file.size,
      processedSize: compressedFile.size,
      compressionRatio: 1 - (compressedFile.size / file.size),
      processingTime: endTime - startTime
    });
    
    return compressedFile;
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
}

/**
 * Handle background removal for an image
 */
export async function handleBackgroundRemoval(
  file: File,
  apiKey: string | null,
  selfHosted: boolean,
  serverUrl: string,
  backgroundRemovalModel: string
): Promise<File | null> {
  try {
    const result = await removeImageBackground(file, apiKey, selfHosted, serverUrl, backgroundRemovalModel);
    return result.processedFile;
  } catch (error) {
    console.error('Background removal failed:', error);
    return null;
  }
}

/**
 * Handle image compression
 */
export async function handleCompression(
  file: File,
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number
): Promise<File> {
  const options = {
    maxSizeMB: 10,
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
    useWebWorker: true,
    initialQuality: compressionLevel / 100,
  };
  
  return await browserImageCompression(file, options);
}

export { initializeProcessedImages, downloadProcessedImage } from './processingHelpers';
