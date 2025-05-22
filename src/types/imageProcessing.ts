export interface ProcessedImage {
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
