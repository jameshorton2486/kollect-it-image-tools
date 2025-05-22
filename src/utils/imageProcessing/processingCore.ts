import browserImageCompression from 'browser-image-compression';
import { ProcessedImage } from '@/types/imageProcessing';
import { createObjectUrl } from '@/utils/imageUtils';
import { cacheProcessedImage } from '@/utils/imageCacheUtils';
import { recordCompressionStats } from '@/utils/analyticsUtils';
import { removeImageBackground } from '@/utils/backgroundRemovalApi';
import { logger } from '@/utils/logging';

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
  backgroundOpacity: number = 100,
  backgroundImage: File | null = null
): Promise<File | null> {
  // Process image logic implementation
  try {
    logger.info(`Processing image: ${file.name}`, {
      module: 'ImageProcessing',
      data: {
        fileName: file.name,
        fileSize: file.size,
        compressionLevel,
        maxWidth,
        maxHeight,
        removeBackground: removeBackgroundFlag,
        backgroundModel: backgroundRemovalModel
      }
    });
    
    const startTime = performance.now();
    
    let processedFile = file;
    let backgroundRemoved = false;
    
    // Step 1: Remove background if requested
    if (removeBackgroundFlag) {
      logger.info(`Starting background removal with ${backgroundRemovalModel} model`, {
        module: 'ImageProcessing'
      });
      
      // Get browser background removal settings if using browser model
      let bgRemovalOptions = {};
      if (backgroundRemovalModel === 'browser') {
        const sensitivityLevel = parseInt(localStorage.getItem('bg_removal_sensitivity') || '70', 10);
        const detailLevel = parseInt(localStorage.getItem('bg_removal_detail') || '30', 10);
        const processMethod = localStorage.getItem('bg_removal_method') || 'smart';
        
        bgRemovalOptions = {
          sensitivityLevel,
          preserveDetailsLevel: detailLevel,
          processMethod
        };
        
        logger.info('Browser background removal options:', {
          module: 'ImageProcessing',
          data: bgRemovalOptions
        });
      }
      
      const bgRemovalResult = await removeImageBackground(
        processedFile,
        apiKey,
        selfHosted,
        serverUrl,
        backgroundRemovalModel
      );
      
      if (bgRemovalResult.processedFile) {
        logger.info('Background removal successful', {
          module: 'ImageProcessing',
          data: { 
            originalSize: processedFile.size,
            processedSize: bgRemovalResult.processedFile.size
          }
        });
        processedFile = bgRemovalResult.processedFile;
        backgroundRemoved = true;
        
        // Step 1.5: Add new background if specified and not 'none'
        if (backgroundType !== 'none') {
          if (backgroundType === 'solid' || backgroundType === 'custom') {
            logger.info(`Adding ${backgroundType} background: ${backgroundColor} with opacity ${backgroundOpacity}%`, {
              module: 'ImageProcessing'
            });
            processedFile = await addBackgroundToImage(
              processedFile, 
              backgroundColor,
              backgroundOpacity / 100
            );
          } else if (backgroundType === 'image' && backgroundImage) {
            logger.info(`Adding background image: ${backgroundImage.name}`, {
              module: 'ImageProcessing'
            });
            processedFile = await addImageBackgroundToImage(
              processedFile,
              backgroundImage,
              backgroundOpacity / 100
            );
          }
        }
      } else {
        logger.error('Background removal failed:', {
          module: 'ImageProcessing',
          data: { error: bgRemovalResult.error }
        });
      }
    }
    
    // Step 2: Compress and resize the image
    logger.info('Starting image compression and resizing', { module: 'ImageProcessing' });
    
    // If we're dealing with a PNG with transparency, use specialized compression
    if (processedFile.type === 'image/png' && backgroundRemoved) {
      logger.info('Using specialized compression for transparent PNG', { module: 'ImageProcessing' });
      const optimizedFile = await optimizeTransparentPng(processedFile, maxWidth, maxHeight);
      
      // Only use the optimized file if it's actually smaller
      if (optimizedFile && optimizedFile.size < processedFile.size) {
        logger.info(`PNG optimization successful: ${processedFile.size} → ${optimizedFile.size} bytes`, { 
          module: 'ImageProcessing' 
        });
        processedFile = optimizedFile;
      } else {
        logger.info('Standard compression produced better results than PNG optimization', { 
          module: 'ImageProcessing' 
        });
        const compressedFile = await handleCompression(
          processedFile,
          compressionLevel,
          maxWidth,
          maxHeight
        );
        processedFile = compressedFile;
      }
    } else {
      // Use standard compression for JPEG or other formats
      const compressedFile = await handleCompression(
        processedFile,
        compressionLevel,
        maxWidth,
        maxHeight
      );
      processedFile = compressedFile;
    }
    
    logger.info(`Compression complete: ${processedFile.size} bytes`, { 
      module: 'ImageProcessing',
      data: { 
        originalSize: file.size, 
        finalSize: processedFile.size, 
        compressionRatio: ((file.size - processedFile.size) / file.size).toFixed(2) 
      }
    });
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    logger.info(`Total processing time: ${totalTime.toFixed(2)}ms`, { module: 'ImageProcessing' });
    
    // Record compression statistics
    recordCompressionStats({
      originalSize: file.size,
      processedSize: processedFile.size,
      compressionRatio: 1 - (processedFile.size / file.size),
      processingTime: totalTime
    });
    
    return processedFile;
  } catch (error) {
    logger.error('Error processing image:', {
      module: 'ImageProcessing',
      data: { error }
    });
    return null;
  }
}

/**
 * Special optimization for transparent PNGs
 */
async function optimizeTransparentPng(
  imageFile: File,
  maxWidth: number,
  maxHeight: number
): Promise<File | null> {
  try {
    // Load the image
    const img = await createImageFromFile(imageFile);
    
    // Create a canvas with the target dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    
    if (!ctx) {
      return null;
    }
    
    // Calculate new dimensions while preserving aspect ratio
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    
    if (width > maxWidth || height > maxHeight) {
      if (width > height) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    
    // Set canvas dimensions and draw image
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // Get image data to analyze transparency and content
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Try to find the actual content bounds (remove excess transparent space)
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];
        
        if (alpha > 10) { // Ignore nearly transparent pixels
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          hasContent = true;
        }
      }
    }
    
    // Add padding
    const padding = 5;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);
    
    // If we found content and it's significantly smaller than the full canvas
    if (hasContent && (maxX - minX + 1) < width * 0.95 && (maxY - minY + 1) < height * 0.95) {
      // Create a new canvas with just the content area
      const newWidth = maxX - minX + 1;
      const newHeight = maxY - minY + 1;
      
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = newWidth;
      croppedCanvas.height = newHeight;
      
      const croppedCtx = croppedCanvas.getContext('2d', { alpha: true });
      if (!croppedCtx) return null;
      
      croppedCtx.clearRect(0, 0, newWidth, newHeight);
      croppedCtx.drawImage(
        canvas, 
        minX, minY, newWidth, newHeight,
        0, 0, newWidth, newHeight
      );
      
      // Convert to blob with optimal quality
      const blob = await new Promise<Blob | null>(resolve => {
        croppedCanvas.toBlob(resolve, 'image/png', 0.9);
      });
      
      if (blob) {
        const filename = imageFile.name.replace(/\.[^/.]+$/, '') + '-optimized.png';
        return new File([blob], filename, { type: 'image/png' });
      }
    }
    
    // If cropping wasn't beneficial, compress the full image
    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/png', 0.9);
    });
    
    if (blob) {
      const filename = imageFile.name.replace(/\.[^/.]+$/, '') + '-optimized.png';
      return new File([blob], filename, { type: 'image/png' });
    }
    
    return null;
  } catch (error) {
    logger.error('Error optimizing transparent PNG:', {
      module: 'ImageProcessing',
      data: { error }
    });
    return null;
  }
}

/**
 * Create an image element from a file
 */
async function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
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
 * Add an image background to a transparent image
 */
async function addImageBackgroundToImage(
  foregroundImage: File,
  backgroundImage: File,
  opacity: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Load the foreground image
    const fgImg = new Image();
    fgImg.onload = () => {
      // Load the background image
      const bgImg = new Image();
      bgImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = fgImg.naturalWidth;
        canvas.height = fgImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Calculate best fit for background image (cover)
        const bgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;
        
        let bgDrawWidth, bgDrawHeight, offsetX = 0, offsetY = 0;
        
        if (bgRatio > canvasRatio) {
          // Background is wider than canvas (relatively)
          bgDrawHeight = canvas.height;
          bgDrawWidth = bgImg.naturalWidth * (canvas.height / bgImg.naturalHeight);
          offsetX = (canvas.width - bgDrawWidth) / 2;
        } else {
          // Background is taller than canvas (relatively)
          bgDrawWidth = canvas.width;
          bgDrawHeight = bgImg.naturalHeight * (canvas.width / bgImg.naturalWidth);
          offsetY = (canvas.height - bgDrawHeight) / 2;
        }
        
        // Draw background image with opacity
        ctx.globalAlpha = opacity;
        ctx.drawImage(bgImg, offsetX, offsetY, bgDrawWidth, bgDrawHeight);
        ctx.globalAlpha = 1.0;
        
        // Draw foreground image on top
        ctx.drawImage(fgImg, 0, 0);
        
        // Convert canvas to file
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          
          const filename = foregroundImage.name.replace(/\.[^/.]+$/, '') + '-composite.png';
          const file = new File([blob], filename, { type: 'image/png' });
          resolve(file);
        }, 'image/png');
      };
      
      bgImg.onerror = () => {
        reject(new Error('Failed to load background image'));
      };
      
      bgImg.src = URL.createObjectURL(backgroundImage);
    };
    
    fgImg.onerror = () => {
      reject(new Error('Failed to load foreground image'));
    };
    
    fgImg.src = URL.createObjectURL(foregroundImage);
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
    logger.error('Background removal failed:', {
      module: 'ImageProcessing',
      data: { error }
    });
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
