
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
  backgroundRemovalModel: string,
  backgroundType: string = 'none',
  backgroundColor: string = '#FFFFFF',
  backgroundOpacity: number = 100
): Promise<File | null> {
  // Process image logic implementation
  try {
    console.log(`Processing image: ${file.name}`);
    console.log(`Settings: compression=${compressionLevel}, maxWidth=${maxWidth}, maxHeight=${maxHeight}, removeBackground=${removeBackgroundFlag}`);
    console.log(`Background removal model: ${backgroundRemovalModel}, selfHosted: ${selfHosted}`);
    if (removeBackgroundFlag) {
      console.log(`Background options: type=${backgroundType}, color=${backgroundColor}, opacity=${backgroundOpacity}`);
    }
    
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
        
        // Step 1.5: Add new background if specified and not 'none'
        if (backgroundType !== 'none' && (backgroundType === 'solid' || backgroundType === 'custom')) {
          console.log(`Adding ${backgroundType} background: ${backgroundColor} with opacity ${backgroundOpacity}%`);
          processedFile = await addBackgroundToImage(
            processedFile, 
            backgroundColor,
            backgroundOpacity / 100
          );
        }
      } else {
        console.error('Background removal failed:', bgRemovalResult.error);
      }
    }
    
    // Step 2: Compress and resize the image
    console.log('Starting image compression and resizing');
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
 * Add a solid background to a transparent image
 */
async function addBackgroundToImage(
  imageFile: File,
  backgroundColor: string,
  opacity: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Parse background color to RGB
      let r = 255, g = 255, b = 255;
      if (backgroundColor !== 'transparent') {
        const hex = backgroundColor.replace('#', '');
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
      }
      
      // Draw background color
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw original image on top
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to file
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        
        const filename = imageFile.name.replace(/\.[^/.]+$/, '') + '-bg.png';
        const file = new File([blob], filename, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for adding background'));
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
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
