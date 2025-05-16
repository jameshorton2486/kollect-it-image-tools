
import { toast } from '@/components/ui/use-toast';
import { BackgroundRemovalResult } from './backgroundRemovalApi';

export async function removeBackgroundInBrowser(
  imageFile: File
): Promise<BackgroundRemovalResult> {
  try {
    // Convert File to Image element
    const image = await loadImage(imageFile);
    
    // Process the image to remove background
    const processedBlob = await removeBackground(image);
    
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
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
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
    
    // Simple background removal algorithm (remove white/light backgrounds)
    // This is a basic implementation - will be enhanced with AI models later
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is light (close to white), make it transparent
      const brightness = (r + g + b) / 3;
      if (brightness > 240) {
        data[i + 3] = 0; // Alpha channel (0 = transparent)
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    console.log('Basic background removal completed');
    
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
