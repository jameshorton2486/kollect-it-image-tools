
export interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved?: boolean;
  retryCount?: number;
  processingProgress?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface ProcessingOptions {
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  removeBackground: boolean;
}
