
export interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved: boolean;
  processingError?: string;
  processingProgress?: number;
  retryCount?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  // WordPress functionality fields
  wordpressType?: string;
  newFilename?: string;
  outputFormat?: string;
  exportPath?: string;
  // Multi-format output
  processedFormats?: {
    jpeg?: File;
    webp?: File;
    avif?: File;
  };
  compressionStats?: {
    originalSize: number;
    formatSizes: {
      jpeg?: number;
      webp?: number;
      avif?: number;
    };
    qualityScores?: {
      jpeg?: number;
      webp?: number;
      avif?: number;
    };
    processingTimes?: {
      jpeg?: number;
      webp?: number;
      avif?: number;
    };
  };
}

export interface ImageProcessingOptions {
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  preserveAspectRatio: boolean;
  removeBackground: boolean;
  backgroundType?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundImage?: File | null;
  outputFormat?: string;
}

export interface ImageStats {
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
  originalDimensions: {
    width: number;
    height: number;
  };
  processedDimensions: {
    width: number;
    height: number;
  };
}

// New types for multi-format processing

export type OutputFormat = 'auto' | 'jpeg' | 'webp' | 'avif';

export interface FormatSettings {
  quality: number;
  lossless?: boolean;
}

export interface CompressionSettings {
  jpeg: FormatSettings;
  webp: FormatSettings;
  avif: FormatSettings;
}

export interface WordPressPreset {
  name: string;
  description: string;
  sizes: {
    thumbnail: { width: number; height: number };
    medium: { width: number; height: number };
    large: { width: number; height: number };
    full: { width: number; height: number };
  };
  compressionSettings: CompressionSettings;
  stripMetadata: boolean;
  progressiveLoading: boolean;
  outputFormat: OutputFormat;
}
