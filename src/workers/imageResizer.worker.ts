
// Web Worker for image resizing with bicubic interpolation
const ctx: Worker = self as any;

// Bicubic interpolation values calculation
function calculateBicubic(
  x: number,
  a: number = -0.5 // Default a value for bicubic interpolation
): number {
  const absX = Math.abs(x);
  
  if (absX <= 1) {
    return ((a + 2) * Math.pow(absX, 3)) - ((a + 3) * Math.pow(absX, 2)) + 1;
  } else if (absX < 2) {
    return (a * Math.pow(absX, 3)) - (5 * a * Math.pow(absX, 2)) + (8 * a * absX) - (4 * a);
  } else {
    return 0;
  }
}

// Function to resize an image with bicubic interpolation
async function resizeImage(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  quality: number = 80
): Promise<ImageData> {
  const srcWidth = imageData.width;
  const srcHeight = imageData.height;
  
  // Create canvas for resizing
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Create new ImageData for output
  const outputImageData = new ImageData(targetWidth, targetHeight);
  
  // Scale factors
  const xScale = srcWidth / targetWidth;
  const yScale = srcHeight / targetHeight;
  
  // For each pixel in the target image
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      // Find corresponding position in source image
      const srcX = x * xScale;
      const srcY = y * yScale;
      
      // Get integer parts for neighborhood sampling
      const srcXInt = Math.floor(srcX);
      const srcYInt = Math.floor(srcY);
      
      // Calculate fractional parts for interpolation
      const dx = srcX - srcXInt;
      const dy = srcY - srcYInt;
      
      // Initialize color components
      let r = 0, g = 0, b = 0, a = 0;
      
      // Bicubic interpolation (4x4 pixel neighborhood)
      for (let ky = -1; ky <= 2; ky++) {
        for (let kx = -1; kx <= 2; kx++) {
          // Get source pixel coordinates
          let px = srcXInt + kx;
          let py = srcYInt + ky;
          
          // Clamp coordinates to valid range
          px = Math.max(0, Math.min(px, srcWidth - 1));
          py = Math.max(0, Math.min(py, srcHeight - 1));
          
          // Get source pixel index
          const srcIndex = (py * srcWidth + px) * 4;
          
          // Calculate bicubic weights
          const wx = calculateBicubic(kx - dx);
          const wy = calculateBicubic(ky - dy);
          const weight = wx * wy;
          
          // Sum weighted components
          r += imageData.data[srcIndex] * weight;
          g += imageData.data[srcIndex + 1] * weight;
          b += imageData.data[srcIndex + 2] * weight;
          a += imageData.data[srcIndex + 3] * weight;
        }
      }
      
      // Set output pixel value
      const outIndex = (y * targetWidth + x) * 4;
      outputImageData.data[outIndex] = Math.max(0, Math.min(255, Math.round(r)));
      outputImageData.data[outIndex + 1] = Math.max(0, Math.min(255, Math.round(g)));
      outputImageData.data[outIndex + 2] = Math.max(0, Math.min(255, Math.round(b)));
      outputImageData.data[outIndex + 3] = Math.max(0, Math.min(255, Math.round(a)));
    }
  }
  
  return outputImageData;
}

// Handle messages from main thread
ctx.addEventListener('message', async (event) => {
  try {
    const { imageData, targetWidth, targetHeight, mode, quality } = event.data;
    
    // Progress update
    ctx.postMessage({ type: 'progress', value: 0.2 });
    
    let resizedImageData;
    
    if (mode === 'bicubic') {
      // Use bicubic interpolation
      resizedImageData = await resizeImage(imageData, targetWidth, targetHeight, quality);
    } else {
      // Fallback to canvas resizing
      const canvas = new OffscreenCanvas(targetWidth, targetHeight);
      const context = canvas.getContext('2d')!;
      
      // Create a temporary canvas with source data
      const sourceCanvas = new OffscreenCanvas(imageData.width, imageData.height);
      const sourceContext = sourceCanvas.getContext('2d')!;
      sourceContext.putImageData(imageData, 0, 0);
      
      // Set quality settings
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      // Progress update
      ctx.postMessage({ type: 'progress', value: 0.5 });
      
      // Draw resized image
      context.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
      
      // Get the resized image data
      resizedImageData = context.getImageData(0, 0, targetWidth, targetHeight);
    }
    
    // Progress update
    ctx.postMessage({ type: 'progress', value: 0.8 });
    
    // Return the result to main thread
    ctx.postMessage({ 
      type: 'complete', 
      imageData: resizedImageData,
      width: targetWidth,
      height: targetHeight
    });
    
  } catch (error) {
    // Send error to main thread
    ctx.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default {} as any;
