
import { CompressionOptions } from "@/utils/imageUtils";

export interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved: boolean;
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
  showBeforeAfter: number | null;
}

export interface ImageProcessingOptions {
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  preserveAspectRatio: boolean;
  removeBackground: boolean;
  apiKey: string | null;
}

export interface UseImageProcessingResult extends ImageProcessingState {
  setCompressionLevel: (level: number) => void;
  setMaxWidth: (width: number) => void;
  setMaxHeight: (height: number) => void;
  setPreserveAspectRatio: (preserve: boolean) => void;
  setRemoveBackground: (remove: boolean) => void;
  setApiKey: (key: string | null) => void;
  processImage: (index: number) => Promise<void>;
  processAllImages: () => Promise<void>;
  downloadImage: (index: number) => void;
  downloadAllImages: () => void;
  toggleSelectImage: (index: number) => void;
  selectAllImages: (selected: boolean) => void;
  toggleBeforeAfterView: (index: number | null) => void;
}
