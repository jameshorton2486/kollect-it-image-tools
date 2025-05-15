
import { ImageProcessingEvent } from './types';
import { getAnalyticsData, saveAnalyticsData } from './storage';

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
