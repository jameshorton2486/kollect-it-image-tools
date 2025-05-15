
import { AnalyticsData } from './types';

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
 * Clear all analytics data
 */
export function clearAnalyticsData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
