
export interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved: boolean;
  processingError?: string;
  // New fields for WordPress functionality
  wordpressType?: string;
  newFilename?: string;
  outputFormat?: string;
  exportPath?: string;
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
