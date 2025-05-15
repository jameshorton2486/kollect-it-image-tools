
// Main exports file for analytics functionality
export { trackEvent } from './eventTracking';
export { recordCompressionStats, getUsageStats } from './statistics';
export { getAnalyticsData, saveAnalyticsData, clearAnalyticsData } from './storage';
export type { ImageProcessingEvent, CompressionStats, AnalyticsData } from './types';
