
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

// Remove background using canvas operations
export const removeBackground = async (
  imageElement: HTMLImageElement,
  options: BackgroundRemovalOptions = {}
): Promise<Blob> => {
  try {
    console.log('Starting background removal process with options:', options);
    
    // Default options
    const sensitivity = options.sensitivityLevel !== undefined ? options.sensitivityLevel : 50;
    const preserveDetails = options.preserveDetailsLevel !== undefined ? options.preserveDetailsLevel : 50;
    const method = options.processMethod || 'brightness';
    
    // Calculate thresholds based on sensitivity
    const brightnessThreshold = Math.max(200, 255 - (sensitivity * 0.55));
    const detailPreservation = preserveDetails / 100;
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Set dimensions and draw image
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Choose processing method
    if (method === 'brightness') {
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
    } else {
      // Smart mode - combines brightness and edge detection
      // For simplicity, we'll use a combination of the brightness method with additional processing
      
      // First pass: brightness-based removal
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const brightness = (r + g + b) / 3;
        
        if (brightness > brightnessThreshold) {
          const distanceFromThreshold = brightness - brightnessThreshold;
          const maxDistance = 255 - brightnessThreshold;
          let transparencyPercentage = distanceFromThreshold / maxDistance;
          
          // Apply the detail preservation factor
          transparencyPercentage = Math.min(1, transparencyPercentage / detailPreservation);
          
          // Set the alpha channel (0 = transparent, 255 = opaque)
          data[i + 3] = Math.max(0, 255 * (1 - transparencyPercentage));
        }
      }
      
      // We'd add more advanced processing here in a real implementation
      console.log('Smart background removal applied with limited capabilities in browser');
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
