
/**
 * Performance optimization utilities
 */

/**
 * Optimize image processing based on device capabilities and image size
 * @param imageWidth Width of the image
 * @param imageHeight Height of the image
 */
export function getOptimalProcessingSettings(imageWidth?: number, imageHeight?: number) {
  // Detect if device is low-powered
  const isLowPoweredDevice = navigator.hardwareConcurrency <= 2;
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Base settings
  const settings = {
    maxConcurrentProcessing: isLowPoweredDevice ? 1 : Math.min(3, navigator.hardwareConcurrency - 1),
    useProgressiveLoading: true,
    useWebWorkers: true,
    adaptiveQuality: isLowPoweredDevice ? 0.7 : 0.85,
    maxImageDimension: isLowPoweredDevice ? 1500 : 2500,
    processingChunkSize: isLowPoweredDevice ? 500000 : 1000000, // Process image in chunks of pixels
    useDownsampling: false,
    samplingFactor: 1.0
  };
  
  // Adjust settings based on image resolution if provided
  if (imageWidth && imageHeight) {
    const megapixels = (imageWidth * imageHeight) / 1000000;
    
    // For high resolution images
    if (megapixels > 10) {
      settings.useDownsampling = true;
      settings.samplingFactor = isMobileDevice ? 0.5 : 0.7;
      settings.maxConcurrentProcessing = Math.max(1, settings.maxConcurrentProcessing - 1); // Reduce concurrency
    }
    else if (megapixels > 5) {
      settings.useDownsampling = isLowPoweredDevice;
      settings.samplingFactor = 0.8;
    }
    
    // Log optimization strategy
    console.log(`Performance optimization: ${megapixels.toFixed(1)}MP image, using:`, settings);
  }
  
  return settings;
}

/**
 * Optimize processing speed based on image characteristics
 */
export function getProcessingOptimizations(file: File, imageWidth: number, imageHeight: number) {
  const sizeInMB = file.size / (1024 * 1024);
  const megapixels = (imageWidth * imageHeight) / 1000000;
  
  return {
    // For very large images, recommend downsampling first
    shouldDownsampleFirst: megapixels > 12 || sizeInMB > 10,
    // Recommended processing quality (lower for larger images)
    recommendedQuality: Math.max(0.7, 1 - (megapixels / 20)),
    // Whether to use progressive processing
    useProgressiveProcessing: megapixels > 8,
    // Whether to use web workers
    useWebWorkers: megapixels > 2,
    // Processing in chunks recommended for large images
    useChunkedProcessing: megapixels > 16,
    // Optimal chunk size in pixels
    chunkSize: Math.min(1000000, Math.max(500000, 4000000 / megapixels))
  };
}
