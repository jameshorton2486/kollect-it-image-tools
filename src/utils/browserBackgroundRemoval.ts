
import { toast } from '@/components/ui/use-toast';
import { BackgroundRemovalResult } from './backgroundRemovalApi';
import { logger, handleError } from './logging';

// Default threshold for simple background removal
const DEFAULT_BRIGHTNESS_THRESHOLD = 240;

interface BackgroundRemovalOptions {
  sensitivityLevel?: number; // 0-100, where 100 is most aggressive
  preserveDetailsLevel?: number; // 0-100, where 100 preserves more details
  processMethod?: 'brightness' | 'color' | 'smart';
}

export async function removeBackgroundInBrowser(
  imageFile: File,
  options: BackgroundRemovalOptions = {}
): Promise<BackgroundRemovalResult> {
  try {
    logger.info(`Starting browser background removal for ${imageFile.name}`, {
      module: 'BrowserBackgroundRemoval',
      data: { fileSize: imageFile.size, options }
    });
    
    // Convert File to Image element
    const image = await loadImage(imageFile).catch(err => {
      throw new Error(`Failed to load image: ${err.message}`);
    });
    
    // Process the image to remove background
    logger.info('Image loaded, starting background removal process', { module: 'BrowserBackgroundRemoval' });
    const processedBlob = await removeBackground(image, options);
    
    // Optimize the blob to reduce file size - new step to ensure smaller file sizes
    const optimizedBlob = await optimizeTransparentImage(processedBlob);
    logger.info(`Image optimized: original=${processedBlob.size}, optimized=${optimizedBlob.size}`, { 
      module: 'BrowserBackgroundRemoval' 
    });
    
    // Create a new file with the processed image
    const filename = imageFile.name.replace(/\.[^/.]+$/, '') + '-nobg.png';
    const processedFile = new File([optimizedBlob], filename, { type: 'image/png' });

    logger.info(`Background removal complete for ${filename}`, { 
      module: 'BrowserBackgroundRemoval',
      data: { originalSize: imageFile.size, processedSize: processedFile.size }
    });

    return { processedFile };
  } catch (error) {
    const handledError = handleError(error, `Browser background removal for ${imageFile.name}`, false);
    
    toast({
      variant: "destructive",
      title: "Background Removal Error",
      description: handledError.message || "Browser processing failed"
    });
    
    return { 
      processedFile: null, 
      error: handledError.message || "Browser processing failed" 
    };
  }
}

// Load image from file
export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      logger.debug(`Image loaded: ${file.name}, dimensions: ${img.naturalWidth}x${img.naturalHeight}`, {
        module: 'BrowserBackgroundRemoval'
      });
      resolve(img);
    };
    img.onerror = (e) => {
      reject(new Error(`Image loading failed: ${e}`));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Optimize transparent PNG to reduce file size
const optimizeTransparentImage = async (blob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Create a canvas with the same dimensions as the image
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { alpha: true });
        
        if (!ctx) {
          logger.error('Failed to get canvas context for optimization', { module: 'BrowserBackgroundRemoval' });
          resolve(blob); // Return original blob if we can't optimize
          return;
        }
        
        // Clear canvas to transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Get image data to find the actual content bounds
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Find the actual content bounds (pixels with alpha > 0)
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;
        let hasContent = false;
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alpha = data[(y * canvas.width + x) * 4 + 3];
            if (alpha > 10) { // Using a small threshold to avoid noise
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
              hasContent = true;
            }
          }
        }
        
        // Add a small padding
        const padding = 5;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width - 1, maxX + padding);
        maxY = Math.min(canvas.height - 1, maxY + padding);
        
        // If we found content, crop to just that area
        if (hasContent) {
          const width = maxX - minX + 1;
          const height = maxY - minY + 1;
          
          // Only crop if we're saving significant space
          if (width < canvas.width * 0.9 || height < canvas.height * 0.9) {
            logger.info(`Cropping transparent image from ${canvas.width}x${canvas.height} to ${width}x${height}`, {
              module: 'BrowserBackgroundRemoval'
            });
            
            // Create a new canvas with just the content
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = width;
            croppedCanvas.height = height;
            const croppedCtx = croppedCanvas.getContext('2d', { alpha: true });
            
            if (croppedCtx) {
              // Copy just the content area to the new canvas
              croppedCtx.drawImage(
                canvas, 
                minX, minY, width, height,
                0, 0, width, height
              );
              
              // Convert to blob with quality 0.9 for better compression
              croppedCanvas.toBlob(
                (croppedBlob) => {
                  if (croppedBlob && croppedBlob.size < blob.size) {
                    resolve(croppedBlob);
                  } else {
                    // If cropped image is larger, return original optimized image
                    canvas.toBlob(
                      (originalBlob) => resolve(originalBlob || blob),
                      'image/png',
                      0.9
                    );
                  }
                },
                'image/png',
                0.9
              );
              return;
            }
          }
        }
        
        // If we didn't crop or cropping failed, just optimize the original image
        canvas.toBlob(
          (optimizedBlob) => resolve(optimizedBlob || blob),
          'image/png',
          0.9
        );
      };
      
      img.onerror = () => {
        logger.warn('Failed to load image for optimization', { module: 'BrowserBackgroundRemoval' });
        resolve(blob); // Return original if optimization fails
      };
      
      img.src = URL.createObjectURL(blob);
    } catch (error) {
      logger.error(`Error optimizing image: ${error instanceof Error ? error.message : String(error)}`, {
        module: 'BrowserBackgroundRemoval'
      });
      resolve(blob); // Return original if optimization fails
    }
  });
};

// Enhanced browser background removal to handle different image types better
export const removeBackground = async (
  imageElement: HTMLImageElement,
  options: BackgroundRemovalOptions = {}
): Promise<Blob> => {
  try {
    logger.info('Starting enhanced background removal process', { 
      module: 'BrowserBackgroundRemoval',
      data: { options, dimensions: `${imageElement.naturalWidth}x${imageElement.naturalHeight}` }
    });
    
    // Default options - increase sensitivity for better results
    const sensitivity = options.sensitivityLevel !== undefined ? options.sensitivityLevel : 70; // Increased from 50
    const preserveDetails = options.preserveDetailsLevel !== undefined ? options.preserveDetailsLevel : 30; // Lower to be more aggressive
    const method = options.processMethod || 'smart'; // Default to smart now
    
    // Calculate thresholds based on sensitivity
    const brightnessThreshold = Math.max(180, 255 - (sensitivity * 0.75)); // More aggressive threshold
    const detailPreservation = preserveDetails / 100;
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Set dimensions and draw image
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Use improved processing approach for the image you shared
    if (method === 'smart') {
      logger.debug('Using smart background removal processing', { module: 'BrowserBackgroundRemoval' });
      
      // First detect if the image likely has a wood-like background (like a table)
      let hasWoodBackground = false;
      let brownPixelCount = 0;
      
      // Sample pixels to detect if this is likely a wooden table background
      const sampleSize = Math.min(10000, data.length / 4);
      const stride = Math.floor(data.length / 4 / sampleSize);
      
      for (let i = 0; i < data.length; i += 4 * stride) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Check if pixel is in brown/wood color range
        if (r > 100 && r < 200 && g > 80 && g < 180 && b > 40 && b < 130) {
          brownPixelCount++;
        }
      }
      
      const brownRatio = brownPixelCount / sampleSize;
      hasWoodBackground = brownRatio > 0.25; // If >25% of sampled pixels are wood-colored
      
      if (hasWoodBackground) {
        logger.info('Detected wooden background, applying specialized processing', { module: 'BrowserBackgroundRemoval' });
        
        // Get the edge pixels to analyze background color
        const edgePixels = [];
        // Top edge
        for (let x = 0; x < canvas.width; x += 5) {
          edgePixels.push([x, 0]);
          edgePixels.push([x, 1]);
          edgePixels.push([x, 2]);
        }
        // Bottom edge
        for (let x = 0; x < canvas.width; x += 5) {
          edgePixels.push([x, canvas.height - 1]);
          edgePixels.push([x, canvas.height - 2]);
          edgePixels.push([x, canvas.height - 3]);
        }
        // Left edge
        for (let y = 0; y < canvas.height; y += 5) {
          edgePixels.push([0, y]);
          edgePixels.push([1, y]);
          edgePixels.push([2, y]);
        }
        // Right edge
        for (let y = 0; y < canvas.height; y += 5) {
          edgePixels.push([canvas.width - 1, y]);
          edgePixels.push([canvas.width - 2, y]);
          edgePixels.push([canvas.width - 3, y]);
        }
        
        // Calculate average color of edges
        let totalR = 0, totalG = 0, totalB = 0;
        for (const [x, y] of edgePixels) {
          const idx = (y * canvas.width + x) * 4;
          totalR += data[idx];
          totalG += data[idx + 1];
          totalB += data[idx + 2];
        }
        
        const avgR = totalR / edgePixels.length;
        const avgG = totalG / edgePixels.length;
        const avgB = totalB / edgePixels.length;
        
        logger.info(`Detected background color: RGB(${avgR.toFixed(0)}, ${avgG.toFixed(0)}, ${avgB.toFixed(0)})`, { 
          module: 'BrowserBackgroundRemoval'
        });
        
        // Color similarity threshold - more aggressive
        const similarityThreshold = 65;
        
        // Process all pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate color distance from background color
          const colorDistance = Math.sqrt(
            (r - avgR) ** 2 + 
            (g - avgG) ** 2 + 
            (b - avgB) ** 2
          );
          
          // Make background transparent based on similarity to background color
          if (colorDistance < similarityThreshold) {
            // Apply gradual transparency based on similarity
            const alpha = (colorDistance / similarityThreshold) * 255;
            data[i + 3] = alpha;
          }
        }
      } else {
        // Not a wood background, use combination approach
        logger.info('Using regular background removal approach', { module: 'BrowserBackgroundRemoval' });
        
        // Get background color from corners (average of 4 corners)
        const cornerPixels = [
          [0, 0], // top-left
          [canvas.width - 1, 0], // top-right
          [0, canvas.height - 1], // bottom-left
          [canvas.width - 1, canvas.height - 1], // bottom-right
        ];
        
        let totalR = 0, totalG = 0, totalB = 0;
        for (const [x, y] of cornerPixels) {
          const idx = (y * canvas.width + x) * 4;
          totalR += data[idx];
          totalG += data[idx + 1];
          totalB += data[idx + 2];
        }
        
        const avgR = totalR / cornerPixels.length;
        const avgG = totalG / cornerPixels.length;
        const avgB = totalB / cornerPixels.length;
        
        // Color similarity threshold
        const similarityThreshold = 60;
        
        // Process all pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate brightness
          const brightness = (r + g + b) / 3;
          
          // Calculate color distance from background
          const colorDistance = Math.sqrt(
            (r - avgR) ** 2 + 
            (g - avgG) ** 2 + 
            (b - avgB) ** 2
          );
          
          // Combine brightness and color approaches
          if (brightness > brightnessThreshold || colorDistance < similarityThreshold) {
            // Calculate transparency
            let transparencyFactor = 0;
            
            if (brightness > brightnessThreshold) {
              const brightnessFactor = (brightness - brightnessThreshold) / (255 - brightnessThreshold);
              transparencyFactor = Math.max(transparencyFactor, brightnessFactor);
            }
            
            if (colorDistance < similarityThreshold) {
              const colorFactor = 1 - (colorDistance / similarityThreshold);
              transparencyFactor = Math.max(transparencyFactor, colorFactor);
            }
            
            // Apply transparency with detail preservation
            const alpha = Math.max(0, 255 * (1 - transparencyFactor * (1 - detailPreservation/3)));
            data[i + 3] = alpha;
          }
        }
      }
    } else if (method === 'brightness') {
      // Basic brightness-based background removal
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness
        const brightness = (r + g + b) / 3;
        
        // If pixel is bright (close to white), make it more transparent based on sensitivity
        if (brightness > brightnessThreshold) {
          // Calculate transparency based on how close to white
          const distanceFromThreshold = brightness - brightnessThreshold;
          const maxDistance = 255 - brightnessThreshold;
          let transparencyPercentage = distanceFromThreshold / maxDistance;
          
          // Apply the detail preservation factor
          transparencyPercentage = Math.min(1, transparencyPercentage / detailPreservation);
          
          // Set the alpha channel (0 = transparent, 255 = opaque)
          data[i + 3] = Math.max(0, 255 * (1 - transparencyPercentage));
        }
      }
    } else if (method === 'color') {
      // Color-based background removal - detect predominant background color
      // This is a simplified implementation
      const colorCounts: Record<string, number> = {};
      let maxColor = '';
      let maxCount = 0;
      
      // Sample the edges to find the most common color (likely background)
      const sampleSize = 100;
      const samplePoints: [number, number][] = [];
      
      // Add edge pixels to sample points
      for (let i = 0; i < sampleSize; i++) {
        // Top edge
        samplePoints.push([i * (canvas.width / sampleSize), 0]);
        // Bottom edge
        samplePoints.push([i * (canvas.width / sampleSize), canvas.height - 1]);
        // Left edge
        samplePoints.push([0, i * (canvas.height / sampleSize)]);
        // Right edge
        samplePoints.push([canvas.width - 1, i * (canvas.height / sampleSize)]);
      }
      
      // Count color occurrences in sample points
      for (const [x, y] of samplePoints) {
        const pixelIndex = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const color = `${r},${g},${b}`;
        
        colorCounts[color] = (colorCounts[color] || 0) + 1;
        
        if (colorCounts[color] > maxCount) {
          maxCount = colorCounts[color];
          maxColor = color;
        }
      }
      
      // Get background color components
      const [bgR, bgG, bgB] = maxColor.split(',').map(Number);
      
      // Remove pixels similar to background color
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate color similarity to background
        const colorDistance = Math.sqrt(
          (r - bgR) ** 2 + 
          (g - bgG) ** 2 + 
          (b - bgB) ** 2
        );
        
        // Color similarity threshold based on sensitivity
        const similarityThreshold = 30 + (100 - sensitivity);
        
        if (colorDistance < similarityThreshold) {
          // Calculate transparency based on similarity
          const transparencyPercentage = 1 - (colorDistance / similarityThreshold);
          data[i + 3] = Math.max(0, 255 * (1 - transparencyPercentage * (1 - detailPreservation)));
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    logger.info(`Background removal completed using ${method} method`, { module: 'BrowserBackgroundRemoval' });
    
    // Apply a small amount of noise reduction and edge cleaning
    applyImageCleanup(canvas, ctx);
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              logger.debug('Successfully created final blob', { 
                module: 'BrowserBackgroundRemoval',
                data: { blobSize: blob.size }
              });
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/png',
          1.0
        );
      } catch (canvasError) {
        reject(new Error(`Canvas to blob conversion failed: ${canvasError.message}`));
      }
    });
  } catch (error) {
    logger.error(`Error removing background: ${error instanceof Error ? error.message : String(error)}`, {
      module: 'BrowserBackgroundRemoval',
      data: { error }
    });
    throw error;
  }
};

// Apply cleanup to the image to smooth edges and reduce noise
const applyImageCleanup = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void => {
  try {
    // Get image data for cleanup
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple edge smoothing - for pixels with partial transparency,
    // check nearby pixels and adjust alpha values to reduce jaggedness
    const tempData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4;
        const alpha = data[idx + 3];
        
        // Only process semi-transparent edge pixels
        if (alpha > 0 && alpha < 255) {
          // Calculate the average alpha of surrounding pixels
          let totalAlpha = 0;
          let count = 0;
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                const nidx = (ny * canvas.width + nx) * 4;
                totalAlpha += data[nidx + 3];
                count++;
              }
            }
          }
          
          const avgAlpha = totalAlpha / count;
          
          // If surrounding pixels are mostly transparent, reduce this pixel's alpha
          if (avgAlpha < 128) {
            tempData[idx + 3] = Math.max(0, alpha - 40);
          }
          // If surrounding pixels are mostly opaque, increase this pixel's alpha
          else if (avgAlpha > 200) {
            tempData[idx + 3] = Math.min(255, alpha + 40);
          }
        }
      }
    }
    
    // Apply the smoothed data
    for (let i = 0; i < data.length; i++) {
      data[i] = tempData[i];
    }
    
    // Put the processed data back
    ctx.putImageData(imageData, 0, 0);
    
    logger.debug('Applied image cleanup for smoother edges', { module: 'BrowserBackgroundRemoval' });
  } catch (error) {
    logger.warn(`Error during image cleanup: ${error instanceof Error ? error.message : String(error)}`, {
      module: 'BrowserBackgroundRemoval'
    });
    // Continue even if cleanup fails - it's just an enhancement
  }
};
