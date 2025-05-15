
// This file is now a simple re-export to maintain API compatibility
// while splitting the implementation into smaller files
export {
  trackEvent,
  recordCompressionStats,
  getUsageStats,
  getAnalyticsData,
  saveAnalyticsData,
  clearAnalyticsData
} from './analytics';
export type { ImageProcessingEvent, CompressionStats, AnalyticsData } from './analytics';
