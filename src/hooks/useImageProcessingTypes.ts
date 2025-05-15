
import { ProcessedImage } from "@/types/imageProcessing";

export interface UseImageProcessingState {
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

export interface UseImageProcessingActions {
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

export type UseImageProcessingResult = UseImageProcessingState & UseImageProcessingActions;
