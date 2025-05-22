export interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved?: boolean;
  wordpressType?: string;
  webpFile?: File;
  avifFile?: File;
  processedFormats?: {
    [key: string]: File;
  };
  newFilename?: string;
  outputFormat?: string;
  processingError?: string;
  compressionStats?: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    qualityUsed: number;
    formatSizes?: {
      [format: string]: number;
    };
    qualityScores?: {
      [format: string]: number;
    };
    processingTimes?: {
      [format: string]: number;
    };
  };
  dimensions?: {
    width: number;
    height: number;
  };
  processedDimensions?: {
    width: number;
    height: number;
  };
  processingTime?: number; // time taken in milliseconds
  dpi?: number; // for print resolution support
  colorSpace?: string; // for color space handling
  hasTransparency?: boolean; // useful for format suggestions
  estimatedQualityScore?: number; // estimated quality score (0-100)
  smartCropInfo?: {
    hasFaces: boolean;
    faceCoordinates?: Array<{x: number, y: number, width: number, height: number}>;
    ruleOfThirdsPoints?: Array<{x: number, y: number}>;
    salientRegion?: {x: number, y: number, width: number, height: number};
  };
  retryCount?: number; // track retry attempts for processing
  processingProgress?: number; // progress percentage during processing
  source?: {
    repository?: string;
    path?: string;
    gitUrl?: string;
  };
  productId?: string; // Added product ID for folder organization
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
