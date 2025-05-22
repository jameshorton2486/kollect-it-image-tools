
/**
 * Utilities for monitoring and optimizing performance
 */

// Performance measurement for image processing
interface PerformanceMeasurement {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  imageSize?: number;
  imageResolution?: string;
  memoryUsage?: number;
}

// Performance thresholds for different image sizes
interface PerformanceThresholds {
  lowRes: number; // For images < 1MP
  mediumRes: number; // For images 1-5MP
  highRes: number; // For images > 5MP
  [key: string]: number; // Index signature
}

// Thresholds in milliseconds for different operations
const operationThresholds: Record<string, PerformanceThresholds> = {
  'background-removal': { lowRes: 2000, mediumRes: 5000, highRes: 10000 },
  'image-compression': { lowRes: 500, mediumRes: 2000, highRes: 4000 },
  'image-resizing': { lowRes: 300, mediumRes: 1000, highRes: 2000 }
};

// In-memory store for recent performance measurements
const recentMeasurements: PerformanceMeasurement[] = [];
const MAX_MEASUREMENTS = 100; // Limit storage to avoid memory issues

/**
 * Start measuring performance for an operation
 */
export function startMeasuring(operation: string, imageSize?: number, imageResolution?: string): PerformanceMeasurement {
  // Attempt to capture memory usage if available
  let memoryUsage: number | undefined = undefined;
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    // @ts-ignore - memory might not be available in all browsers
    memoryUsage = performance.memory?.usedJSHeapSize;
  }
  
  const measurement: PerformanceMeasurement = {
    operation,
    startTime: performance.now(),
    imageSize,
    imageResolution,
    memoryUsage
  };
  
  return measurement;
}

/**
 * End measurement and record performance data
 */
export function endMeasuring(measurement: PerformanceMeasurement): PerformanceMeasurement {
  measurement.endTime = performance.now();
  measurement.duration = measurement.endTime - measurement.startTime;
  
  // Update memory usage if available
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    // @ts-ignore - memory might not be available in all browsers
    const endMemoryUsage = performance.memory?.usedJSHeapSize;
    if (endMemoryUsage && measurement.memoryUsage) {
      const memoryDelta = endMemoryUsage - measurement.memoryUsage;
      console.log(`Memory usage delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);
    }
  }
  
  // Store measurement
  recentMeasurements.push(measurement);
  
  // Keep array size in check
  if (recentMeasurements.length > MAX_MEASUREMENTS) {
    recentMeasurements.shift();
  }
  
  // Log performance data
  console.log(`Performance: ${measurement.operation} took ${measurement.duration.toFixed(2)}ms`, 
    measurement.imageSize ? `(Image size: ${(measurement.imageSize / 1024).toFixed(2)} KB)` : '',
    measurement.imageResolution || '');
  
  return measurement;
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  const stats: Record<string, { count: number, totalDuration: number, avgDuration: number, byResolution: Record<string, number> }> = {};
  
  recentMeasurements.forEach(measurement => {
    if (!measurement.duration) return;
    
    if (!stats[measurement.operation]) {
      stats[measurement.operation] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        byResolution: {}
      };
    }
    
    stats[measurement.operation].count++;
    stats[measurement.operation].totalDuration += measurement.duration;
    stats[measurement.operation].avgDuration = 
      stats[measurement.operation].totalDuration / stats[measurement.operation].count;
    
    // Track performance by resolution category
    if (measurement.imageResolution) {
      if (!stats[measurement.operation].byResolution[measurement.imageResolution]) {
        stats[measurement.operation].byResolution[measurement.imageResolution] = 0;
      }
      stats[measurement.operation].byResolution[measurement.imageResolution]++;
    }
  });
  
  return stats;
}

/**
 * Categorize image resolution
 */
export function categorizeResolution(width: number, height: number): 'lowRes' | 'mediumRes' | 'highRes' {
  const megapixels = (width * height) / 1000000;
  
  if (megapixels < 1) return 'lowRes';
  if (megapixels < 5) return 'mediumRes';
  return 'highRes';
}

/**
 * Detect performance issues based on adaptive thresholds
 */
export function detectPerformanceIssues() {
  const stats = getPerformanceStats();
  const issues = [];
  
  for (const [operation, data] of Object.entries(stats)) {
    // Find matching threshold category
    let thresholdCategory = '';
    for (const [category, thresholds] of Object.entries(operationThresholds)) {
      if (operation.includes(category)) {
        thresholdCategory = category;
        break;
      }
    }
    
    if (thresholdCategory) {
      const thresholds = operationThresholds[thresholdCategory];
      // Use medium resolution threshold as default
      const threshold = thresholds.mediumRes;
      
      if (data.avgDuration > threshold) {
        issues.push({
          operation,
          avgDuration: data.avgDuration,
          threshold,
          message: `${operation} is taking longer than expected (${data.avgDuration.toFixed(0)}ms)`
        });
      }
    }
  }
  
  return issues;
}

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
 * Get memory usage information if available
 */
export function getMemoryUsage() {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    // @ts-ignore - memory might not be available in all browsers
    const memory = performance.memory;
    return {
      // @ts-ignore
      totalJSHeapSize: memory?.totalJSHeapSize,
      // @ts-ignore
      usedJSHeapSize: memory?.usedJSHeapSize,
      // @ts-ignore
      jsHeapSizeLimit: memory?.jsHeapSizeLimit
    };
  }
  return null;
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

/**
 * Clear performance measurement data
 */
export function clearPerformanceData() {
  recentMeasurements.length = 0;
}
