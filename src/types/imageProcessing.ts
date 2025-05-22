
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
  backgroundRemovalModel: string; // Model for background removal
  backgroundType: string; // Type of background to add after removal (none, solid, custom)
  backgroundColor: string; // Background color in hex format
  backgroundOpacity: number; // Background opacity percentage (0-100)
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
  backgroundType: string;
  backgroundColor: string;
  backgroundOpacity: number;
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
  setBackgroundType: (type: string) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundOpacity: (opacity: number) => void;
}
