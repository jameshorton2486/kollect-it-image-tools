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
}

// In-memory store for recent performance measurements
const recentMeasurements: PerformanceMeasurement[] = [];
const MAX_MEASUREMENTS = 100; // Limit storage to avoid memory issues

/**
 * Start measuring performance for an operation
 */
export function startMeasuring(operation: string, imageSize?: number, imageResolution?: string): PerformanceMeasurement {
  const measurement: PerformanceMeasurement = {
    operation,
    startTime: performance.now(),
    imageSize,
    imageResolution
  };
  
  return measurement;
}

/**
 * End measurement and record performance data
 */
export function endMeasuring(measurement: PerformanceMeasurement): PerformanceMeasurement {
  measurement.endTime = performance.now();
  measurement.duration = measurement.endTime - measurement.startTime;
  
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
  const stats: Record<string, { count: number, totalDuration: number, avgDuration: number }> = {};
  
  recentMeasurements.forEach(measurement => {
    if (!measurement.duration) return;
    
    if (!stats[measurement.operation]) {
      stats[measurement.operation] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0
      };
    }
    
    stats[measurement.operation].count++;
    stats[measurement.operation].totalDuration += measurement.duration;
    stats[measurement.operation].avgDuration = 
      stats[measurement.operation].totalDuration / stats[measurement.operation].count;
  });
  
  return stats;
}

/**
 * Detect performance issues based on thresholds
 */
export function detectPerformanceIssues() {
  const stats = getPerformanceStats();
  const issues = [];
  
  // Define thresholds for different operations
  const thresholds = {
    'background-removal': 5000, // 5 seconds
    'image-compression': 2000,  // 2 seconds
    'image-resizing': 1000      // 1 second
  };
  
  for (const [operation, data] of Object.entries(stats)) {
    for (const [thresholdOp, threshold] of Object.entries(thresholds)) {
      if (operation.includes(thresholdOp) && data.avgDuration > threshold) {
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
 * Optimize image processing based on device capabilities
 */
export function getOptimalProcessingSettings() {
  // Detect if device is low-powered
  const isLowPoweredDevice = navigator.hardwareConcurrency <= 2;
  
  return {
    maxConcurrentProcessing: isLowPoweredDevice ? 1 : Math.min(3, navigator.hardwareConcurrency - 1),
    useProgressiveLoading: true,
    useWebWorkers: true,
    adaptiveQuality: isLowPoweredDevice ? 0.7 : 0.85,
    maxImageDimension: isLowPoweredDevice ? 1500 : 2500
  };
}

/**
 * Clear performance measurement data
 */
export function clearPerformanceData() {
  recentMeasurements.length = 0;
}
