
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
  try {
    console.log(`Processing image: ${file.name}`);
    console.log(`Settings: compression=${compressionLevel}, maxWidth=${maxWidth}, maxHeight=${maxHeight}, removeBackground=${removeBackgroundFlag}`);
    console.log(`Background removal model: ${backgroundRemovalModel}, selfHosted: ${selfHosted}`);
    
    const startTime = performance.now();
    
    let processedFile = file;
    
    // Step 1: Remove background if requested
    if (removeBackgroundFlag) {
      console.log(`Starting background removal with ${backgroundRemovalModel} model`);
      
      // Get browser background removal settings if using browser model
      let bgRemovalOptions = {};
      if (backgroundRemovalModel === 'browser') {
        const sensitivityLevel = parseInt(localStorage.getItem('bg_removal_sensitivity') || '50', 10);
        const detailLevel = parseInt(localStorage.getItem('bg_removal_detail') || '50', 10);
        const processMethod = localStorage.getItem('bg_removal_method') || 'brightness';
        
        bgRemovalOptions = {
          sensitivityLevel,
          preserveDetailsLevel: detailLevel,
          processMethod
        };
        
        console.log('Browser background removal options:', bgRemovalOptions);
      }
      
      const bgRemovalResult = await removeImageBackground(
        processedFile,
        apiKey,
        selfHosted,
        serverUrl,
        backgroundRemovalModel
      );
      
      if (bgRemovalResult.processedFile) {
        console.log('Background removal successful');
        processedFile = bgRemovalResult.processedFile;
      } else {
        console.error('Background removal failed:', bgRemovalResult.error);
      }
    }
    
    // Step 2: Compress the image
    console.log('Starting image compression');
    const compressedFile = await handleCompression(
      processedFile,
      compressionLevel,
      maxWidth,
      maxHeight
    );
    console.log(`Compression complete: ${compressedFile.size} bytes`);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    console.log(`Total processing time: ${totalTime.toFixed(2)}ms`);
    
    // Record compression statistics
    recordCompressionStats({
      originalSize: file.size,
      processedSize: compressedFile.size,
      compressionRatio: 1 - (compressedFile.size / file.size),
      processingTime: totalTime
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
