
export interface ProcessedImage {
  // Original properties
  originalFile: File;
  originalUrl: string;
  optimizedFiles: { [format: string]: { blob: Blob; url: string; size: number } };
  averageCompressionRate: number;
  totalSizeReduction: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  productId?: string;
  processed: boolean;
  originalWidth: number;
  originalHeight: number;
  
  // Additional properties needed by components
  original: File;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved?: boolean;
  processingError?: string;
  newFilename?: string;
  wordpressType?: string;
  dimensions?: { width: number; height: number };
  outputFormat?: string;
  processingTime?: number;
  compressionStats?: {
    originalSize: number;
    formatSizes: { [format: string]: number | null };
    qualityScores?: { [format: string]: number | null };
    processingTimes?: { [format: string]: number | null };
  };
  processedFormats?: { [format: string]: Blob };
  
  // Legacy properties from previous implementation
  newSize?: number;
  blob?: Blob;
  base64?: string;
  originalName?: string;
  originalSize?: number;
  mimeType?: string;
  finalWidth?: number;
  finalHeight?: number;
  format?: string;
  quality?: number;
  convertedImages?: Array<{
    format: string;
    blob: Blob;
    size: number;
    width: number;
    height: number;
  }>;
}

export interface ImageUploadState {
  files: File[];
  previews: string[];
  errors: string[];
  uploading: boolean;
  uploadProgress: number;
}

export interface ImageProcessingSettings {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  removeBackground: boolean;
  stripMetadata: boolean;
  preserveTransparency: boolean;
  format: string;
  resizeMode: string;
  backgroundType: string;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage?: File;
  cropSettings?: CropSettings;
  preserveAspectRatio: boolean;
}

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
  aspect: number;
}

export interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
  onProcessingStateChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ProcessingStatus {
  [filename: string]: 'pending' | 'processing' | 'completed' | 'error';
}

export interface AnalyticsData {
  totalImagesProcessed: number;
  totalOriginalSize: number;
  totalOptimizedSize: number;
  averageCompressionRate: number;
  formatDistribution: { [format: string]: number };
}

export interface ProcessorHeaderProps {
  clearImageCache?: () => void;
  clearAnalyticsData?: () => void;
}

// New types needed by components
export type OutputFormat = 'auto' | 'jpeg' | 'webp' | 'avif';

export interface CompressionSettings {
  jpeg?: {
    quality: number;
    progressive: boolean;
  };
  webp?: {
    quality: number;
    lossless: boolean;
  };
  avif?: {
    quality: number;
    lossless: boolean;
  };
}

export interface WordPressPreset {
  name: string;
  width: number;
  height: number;
  quality: number;
  formats: string[];
  stripMetadata: boolean;
}

// An interface to extend the File type with dimensions property
export interface ImageFile extends File {
  dimensions?: {
    width: number;
    height: number;
  };
}

// Utility type for multi-format processing
export interface ProcessingResult {
  blob: Blob;
  size: number;
  width: number;
  height: number;
  format: string;
  quality: number;
}
