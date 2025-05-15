
export interface ImageProcessingEvent {
  action: 'process' | 'download' | 'batch_process' | 'background_removal';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface CompressionStats {
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  processingTime: number;
}

export interface AnalyticsData {
  events: ImageProcessingEvent[];
  totalImagesProcessed: number;
  totalDownloads: number;
  backgroundRemovalCount: number;
  totalSavedBytes: number;
  averageCompressionRatio: number;
  processingTimes: number[]; // Store processing times in ms
  lastSessionDate: number;
}
