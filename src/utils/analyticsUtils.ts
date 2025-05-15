
interface ImageProcessingEvent {
  action: 'process' | 'download' | 'batch_process' | 'background_removal';
  timestamp: number;
  metadata?: Record<string, any>;
}

interface CompressionStats {
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  processingTime: number;
}

interface AnalyticsData {
  events: ImageProcessingEvent[];
  totalImagesProcessed: number;
  totalDownloads: number;
  backgroundRemovalCount: number;
  totalSavedBytes: number;
  averageCompressionRatio: number;
  processingTimes: number[]; // Store processing times in ms
  lastSessionDate: number;
}

const STORAGE_KEY = 'image_processor_analytics';

const defaultAnalyticsData: AnalyticsData = {
  events: [],
  totalImagesProcessed: 0,
  totalDownloads: 0,
  backgroundRemovalCount: 0,
  totalSavedBytes: 0,
  averageCompressionRatio: 0,
  processingTimes: [],
  lastSessionDate: Date.now(),
};

/**
 * Get analytics data from localStorage
 */
export function getAnalyticsData(): AnalyticsData {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (e) {
    console.error('Failed to parse analytics data:', e);
  }
  return { ...defaultAnalyticsData };
}

/**
 * Save analytics data to localStorage
 */
export function saveAnalyticsData(data: AnalyticsData): void {
  try {
    // Limit the number of events stored to prevent localStorage issues
    if (data.events.length > 100) {
      data.events = data.events.slice(-100); // Keep most recent 100 events
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save analytics data:', e);
  }
}

/**
 * Track an image processing event
 */
export function trackEvent(
  action: ImageProcessingEvent['action'],
  metadata?: Record<string, any>
): void {
  const data = getAnalyticsData();
  
  data.events.push({
    action,
    timestamp: Date.now(),
    metadata,
  });
  
  // Update counters
  switch (action) {
    case 'process':
      data.totalImagesProcessed++;
      break;
    case 'download':
      data.totalDownloads++;
      break;
    case 'background_removal':
      data.backgroundRemovalCount++;
      break;
    // batch_process is tracked separately with its own metadata
  }
  
  // Update lastSessionDate
  data.lastSessionDate = Date.now();
  
  saveAnalyticsData(data);
}

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
 * Clear all analytics data
 */
export function clearAnalyticsData(): void {
  localStorage.removeItem(STORAGE_KEY);
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
