
import { CompressionOptions } from "@/utils/imageUtils";

export interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved: boolean;
  processingProgress?: number; // Progress percentage
  retryCount?: number; // Track how many retries were needed
}

export interface ImageProcessingState {
  processedImages: ProcessedImage[];
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  preserveAspectRatio: boolean;
  isProcessing: boolean;
  removeBackground: boolean;
  apiKey: string | null;
  selfHosted: boolean;
  serverUrl: string;
  showBeforeAfter: number | null;
  batchProgress: number; // Overall batch progress
  totalItemsToProcess: number; // Total number of items in the current batch
  processedItemsCount: number; // Number of completed items
  backgroundRemovalModel: string; // New field for the selected background removal model
}

export interface ImageProcessingOptions {
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  preserveAspectRatio: boolean;
  removeBackground: boolean;
  apiKey: string | null;
  selfHosted: boolean;
  serverUrl: string;
  backgroundRemovalModel: string; // Include the model in options
}

export interface UseImageProcessingResult extends ImageProcessingState {
  setCompressionLevel: (level: number) => void;
  setMaxWidth: (width: number) => void;
  setMaxHeight: (height: number) => void;
  setPreserveAspectRatio: (preserve: boolean) => void;
  setRemoveBackground: (remove: boolean) => void;
  setApiKey: (key: string | null) => void;
  setSelfHosted: (selfHosted: boolean) => void;
  setServerUrl: (url: string) => void;
  processImage: (index: number) => Promise<void>;
  processAllImages: () => Promise<void>;
  downloadImage: (index: number) => void;
  downloadAllImages: () => void;
  toggleSelectImage: (index: number) => void;
  selectAllImages: (selected: boolean) => void;
  toggleBeforeAfterView: (index: number | null) => void;
  cancelBatchProcessing: () => void;
  clearImageCache: () => void;
  clearAnalyticsData: () => void; 
  setBackgroundRemovalModel: (model: string) => void; // New setter for the model
}
