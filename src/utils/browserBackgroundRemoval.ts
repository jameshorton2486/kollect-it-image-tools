import { toast } from '@/components/ui/use-toast';
import { BackgroundRemovalResult } from './backgroundRemovalApi';

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
    // Convert File to Image element
    const image = await loadImage(imageFile);
    
    // Process the image to remove background
    const processedBlob = await removeBackground(image, options);
    
    // Create a new file with the processed image
    const filename = imageFile.name.replace(/\.[^/.]+$/, '') + '-nobg.png';
    const processedFile = new File([processedBlob], filename, { type: 'image/png' });

    return { processedFile };
  } catch (error) {
    console.error('Browser background removal error:', error);
    toast({
      variant: "destructive",
      title: "Background Removal Error",
      description: error instanceof Error ? error.message : "Browser processing failed"
    });
    return { processedFile: null, error: error instanceof Error ? error.message : "Browser processing failed" };
  }
}

// Load image from file
export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Enhanced browser background removal to handle different image types better
export const removeBackground = async (
  imageElement: HTMLImageElement,
  options: BackgroundRemovalOptions = {}
): Promise<Blob> => {
  try {
    console.log('Starting enhanced background removal process with options:', options);
    
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
      console.log('Using smart background removal processing');
      
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
        console.log('Detected wooden background, applying specialized processing');
        
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
        
        console.log(`Detected background color: RGB(${avgR.toFixed(0)}, ${avgG.toFixed(0)}, ${avgB.toFixed(0)})`);
        
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
        console.log('Using regular background removal approach');
        
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
    console.log(`Background removal completed using ${method} method`);
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};
