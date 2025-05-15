
import { CompressionStats } from './types';
import { getAnalyticsData, saveAnalyticsData } from './storage';

/**
 * Record compression statistics
 */
export function recordCompressionStats(stats: CompressionStats): void {
  const data = getAnalyticsData();
  
  // Update compression statistics
  const savedBytes = stats.originalSize - stats.processedSize;
  data.totalSavedBytes += savedBytes;
  
  // Update processing time metrics
  data.processingTimes.push(stats.processingTime);
  
  // Recalculate average compression ratio
  const totalCompressedImages = data.processingTimes.length;
  if (totalCompressedImages > 0) {
    // Append this ratio to running calculation
    data.averageCompressionRatio = (
      (data.averageCompressionRatio * (totalCompressedImages - 1)) + 
      stats.compressionRatio
    ) / totalCompressedImages;
  }
  
  saveAnalyticsData(data);
}

/**
 * Get basic usage statistics
 */
export function getUsageStats() {
  const data = getAnalyticsData();
  
  // Calculate additional metrics
  const totalImages = data.totalImagesProcessed;
  const totalSessionsCount = new Set(
    data.events.map(event => new Date(event.timestamp).toDateString())
  ).size;
  
  const averageProcessingTime = data.processingTimes.length > 0
    ? data.processingTimes.reduce((sum, time) => sum + time, 0) / data.processingTimes.length
    : 0;
  
  return {
    totalImages,
    totalDownloads: data.totalDownloads,
    backgroundRemovalCount: data.backgroundRemovalCount,
    totalSavedBytes: data.totalSavedBytes,
    averageCompressionRatio: data.averageCompressionRatio,
    averageProcessingTime,
    totalSessionsCount,
    lastSessionDate: data.lastSessionDate
  };
}
