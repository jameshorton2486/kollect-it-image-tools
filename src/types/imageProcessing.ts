
export interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved: boolean;
  retryCount?: number;
  processingProgress?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  processingStats?: {
    duration?: number;
    originalSize: number;
    processedSize?: number;
    compressionRatio?: number;
    optimizations?: string[];
  };
}

export interface ProcessingOptions {
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  removeBackground: boolean;
  backgroundType?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundImage?: File | null;
  performanceOptimizations?: {
    useDownsampling: boolean;
    samplingFactor: number;
    useProgressiveProcessing: boolean;
    useWebWorkers: boolean;
  };
}
