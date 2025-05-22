
export interface ProcessedImage {
  originalFile: File;
  original: File;
  originalUrl: string;
  preview: string;
  optimizedFiles: Record<string, File | Blob>;
  averageCompressionRate: number;
  totalSizeReduction: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed: boolean;
  isProcessing: boolean;
  isSelected: boolean;
  originalWidth: number;
  originalHeight: number;
  dimensions: {
    width: number;
    height: number;
  };
  compressionStats?: {
    formatSizes: Record<string, number>;
    originalSize: number;
    percentSaved: number;
    totalSaved: number;
  };
  outputFormat?: OutputFormat;
  wordpressType?: string;
  newFilename?: string;
  processedFormats?: Record<string, Blob>;
  processingTime?: number;
  processingError?: string;
  hasBackgroundRemoved?: boolean;
  blob?: Blob;
  newSize?: number;
}

export interface ProcessorHeaderProps {
  clearImageCache: () => void;
  clearAnalyticsData: () => void;
}

export interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
}

export interface EmptyStateProps {
  onReset: () => void;
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

export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif';

export interface CompressionSettings {
  jpeg: {
    quality: number;
    progressive: boolean;
  };
  png: {
    quality: number;
    lossless: boolean;
  };
  webp: {
    quality: number;
    lossless: boolean;
  };
  avif: {
    quality: number;
  };
}

export interface WordPressPreset {
  name: string;
  description?: string;
  width: number;
  height: number;
  format: OutputFormat;
  quality: number;
  id: string;
}

export interface ImageProcessingSettings {
  width?: number;
  height?: number;
  format: OutputFormat;
  quality: number;
  compressionLevel?: 'lossless' | 'high' | 'medium' | 'low';
  preserveMetadata?: boolean;
  useMultiFormat?: boolean;
  formats?: OutputFormat[];
  wordpressType?: string;
}
