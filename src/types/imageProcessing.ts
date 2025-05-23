
import { ResizeMode, ResizeUnit } from './imageResizing';

// Core Types
export interface ProcessedImage {
  originalFile: File;
  original: File;
  originalUrl: string;
  preview: string;
  processed?: File | Blob;
  optimizedFiles: Record<string, ProcessedFormat>;
  blob?: Blob;
  newSize?: number;
  averageCompressionRate: number;
  totalSizeReduction: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  isProcessing: boolean;
  isSelected: boolean;
  originalWidth: number;
  originalHeight: number;
  dimensions: {
    width: number;
    height: number;
  };
  processedDimensions?: {
    width: number;
    height: number;
  };
  wordpressType?: string;
  newFilename?: string;
  productId?: string;
  outputFormat?: string;
  processingTime?: number;
  processingError?: string;
  processingProgress?: number;
  retryCount?: number;
  hasBackgroundRemoved?: boolean;
  compressionStats?: CompressionStats;
  processedFormats?: Record<string, ProcessedFormat>;
  format?: string;
  finalWidth?: number;
  finalHeight?: number;
  error?: string;
}

export interface ProcessedFormat {
  blob: Blob;
  url: string;
  size: number;
  format: string;
  quality: number;
  name?: string;
}

export interface CompressionStats {
  formatSizes: Record<string, number>;
  originalSize: number;
  percentSaved: number;
  totalSaved: number;
  qualityScores?: Record<string, number>;
  processingTimes?: Record<string, number>;
}

// Compression Settings
export interface CompressionSettings {
  jpeg: {
    quality: number;
  };
  webp: {
    quality: number;
    lossless: boolean;
  };
  png: {
    quality: number;
  };
  avif: {
    quality: number;
  };
}

export interface OutputFormat {
  jpeg: boolean;
  webp: boolean;
  png: boolean;
  avif: boolean;
  original: boolean;
}

// WordPress types
export interface WordPressPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  quality: number;
  format: string;
  description: string;
  sizes?: {
    width: number;
    height: number;
  };
  compressionSettings?: CompressionSettings;
  stripMetadata?: boolean;
  progressiveLoading?: boolean;
  outputFormat?: OutputFormat;
}

// Image Processing Types
export interface ImageProcessingOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: string;
  preserveAspectRatio: boolean;
  stripMetadata: boolean;
  progressiveLoading: boolean;
  removeBackground: boolean;
  resizeMode: ResizeMode;
  resizeQuality: number;
  compressionLevel: number;
  // Additional properties needed by processing functions
  backgroundType?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundImage?: File | null;
  preserveTransparency?: boolean;
  useMultiFormat?: boolean;
  cropSettings?: any;
}

// Use this type instead of ImageProcessingSettings which seems to be causing errors
export type ImageProcessingSettings = ImageProcessingOptions;

export interface ProcessingResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  error?: string;
  size?: number;
  format?: string;
  width?: number;
  height?: number;
  processingTime?: number;
}

export interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
}

export interface ProcessorBodyProps {
  images: ProcessedImage[];
  onUpdateImages: (updatedImages: ProcessedImage[]) => void;
  onBatchProgress: (progress: number, count: number) => void;
  onProcessingStateChange: (processing: boolean) => void;
}

export interface WordPressPresetsSectionProps {
  onApplyPreset: (preset: WordPressPreset) => void;
}

// Analytics data types
export interface ImageProcessingEvent {
  timestamp: number;
  imageCount: number;
  totalInputSize: number;
  totalOutputSize: number;
  compressionRate: number;
  processingTime: number;
  formats: {
    [key: string]: number;
  };
}

export interface AnalyticsData {
  events: ImageProcessingEvent[];
  totalProcessed: number;
  totalSizeSaved: number;
  averageCompressionRate: number;
  formatUsage: {
    [key: string]: number;
  };
  monthlyTrends: {
    [key: string]: {
      count: number;
      sizeSaved: number;
    };
  };
  mostUsedPresets: {
    [key: string]: number;
  };
}
