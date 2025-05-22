
/**
 * Performance analysis utilities
 */
import { getPerformanceStats } from './measurements';

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
