/**
 * Performance measurement utilities
 */

// Performance measurement for image processing
export interface PerformanceMeasurement {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  imageSize?: number;
  imageResolution?: string;
  memoryUsage?: number;
}

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
 * Clear performance measurement data
 */
export function clearPerformanceData() {
  recentMeasurements.length = 0;
}
