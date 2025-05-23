
import { ImageProcessingEvent, AnalyticsData, ProcessedImage } from '@/types/imageProcessing';

// Default analytics data
const DEFAULT_ANALYTICS: AnalyticsData = {
  events: [],
  totalProcessed: 0,
  totalSizeSaved: 0,
  averageCompressionRate: 0,
  formatUsage: {
    jpeg: 0,
    webp: 0,
    png: 0,
    avif: 0,
  },
  monthlyTrends: {},
  mostUsedPresets: {}
};

// Local storage key for analytics data
const ANALYTICS_KEY = 'kollect-it-image-optimizer-analytics';

/**
 * Track an image processing event
 */
export function trackEvent(event: ImageProcessingEvent): void {
  const analytics = getAnalyticsData();
  analytics.events.push(event);
  
  // Update aggregate statistics
  analytics.totalProcessed += event.imageCount;
  analytics.totalSizeSaved += (event.totalInputSize - event.totalOutputSize);
  
  // Calculate new average compression rate
  const totalCompressionRate = analytics.events.reduce((acc, e) => acc + (e.compressionRate * e.imageCount), 0);
  const totalImages = analytics.events.reduce((acc, e) => acc + e.imageCount, 0);
  analytics.averageCompressionRate = totalCompressionRate / totalImages;
  
  // Update format usage
  Object.entries(event.formats).forEach(([format, count]) => {
    if (!analytics.formatUsage[format]) {
      analytics.formatUsage[format] = 0;
    }
    analytics.formatUsage[format] += count;
  });
  
  // Update monthly trends
  const date = new Date();
  const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
  
  if (!analytics.monthlyTrends[monthKey]) {
    analytics.monthlyTrends[monthKey] = {
      count: 0,
      sizeSaved: 0,
    };
  }
  
  analytics.monthlyTrends[monthKey].count += event.imageCount;
  analytics.monthlyTrends[monthKey].sizeSaved += (event.totalInputSize - event.totalOutputSize);
  
  // Save updated analytics
  saveAnalyticsData(analytics);
}

/**
 * Record compression statistics for a batch of images
 */
export function recordCompressionStats(images: ProcessedImage[], preset?: string): void {
  if (images.length === 0) return;
  
  const event: ImageProcessingEvent = {
    timestamp: Date.now(),
    imageCount: images.length,
    totalInputSize: images.reduce((acc, img) => acc + img.originalFile.size, 0),
    totalOutputSize: images.reduce((acc, img) => {
      // Get the size of the smallest optimized format
      const sizes = Object.values(img.optimizedFiles).map(format => format.size);
      return acc + (sizes.length > 0 ? Math.min(...sizes) : img.originalFile.size);
    }, 0),
    compressionRate: 0,
    processingTime: images.reduce((acc, img) => acc + (img.processingTime || 0), 0),
    formats: {}
  };
  
  // Calculate compression rate
  event.compressionRate = 1 - (event.totalOutputSize / event.totalInputSize);
  
  // Count format usage
  images.forEach(img => {
    Object.keys(img.optimizedFiles).forEach(format => {
      if (!event.formats[format]) {
        event.formats[format] = 0;
      }
      event.formats[format] += 1;
    });
  });
  
  // Track preset usage if applicable
  if (preset) {
    const analytics = getAnalyticsData();
    if (!analytics.mostUsedPresets[preset]) {
      analytics.mostUsedPresets[preset] = 0;
    }
    analytics.mostUsedPresets[preset] += images.length;
    saveAnalyticsData(analytics);
  }
  
  trackEvent(event);
}

/**
 * Get usage statistics for the current month
 */
export function getUsageStats() {
  const analytics = getAnalyticsData();
  const date = new Date();
  const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
  
  return {
    currentMonth: analytics.monthlyTrends[monthKey] || { count: 0, sizeSaved: 0 },
    totalProcessed: analytics.totalProcessed,
    totalSizeSaved: analytics.totalSizeSaved,
    averageCompression: analytics.averageCompressionRate,
    topFormats: Object.entries(analytics.formatUsage)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3),
    topPresets: Object.entries(analytics.mostUsedPresets)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
  };
}

/**
 * Get analytics data from localStorage
 */
export function getAnalyticsData(): AnalyticsData {
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    if (!data) return { ...DEFAULT_ANALYTICS };
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get analytics data:', error);
    return { ...DEFAULT_ANALYTICS };
  }
}

/**
 * Save analytics data to localStorage
 */
export function saveAnalyticsData(data: AnalyticsData): void {
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save analytics data:', error);
  }
}

/**
 * Clear analytics data
 */
export function clearAnalyticsData(): void {
  try {
    localStorage.removeItem(ANALYTICS_KEY);
    console.log('Analytics data cleared');
  } catch (error) {
    console.error('Failed to clear analytics data:', error);
  }
}
