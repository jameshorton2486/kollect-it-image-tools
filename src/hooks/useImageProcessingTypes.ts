
import { 
  ProcessedImage, 
  OutputFormat, 
  CompressionSettings, 
  WordPressPreset 
} from '@/types/imageProcessing';

export interface UseImageProcessingResult {
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  compressionLevel: number;
  setCompressionLevel: (value: number) => void;
  maxWidth: number;
  setMaxWidth: (value: number) => void;
  maxHeight: number;
  setMaxHeight: (value: number) => void;
  preserveAspectRatio: boolean;
  setPreserveAspectRatio: (value: boolean) => void;
  isProcessing: boolean;
  processImage: (index: number) => Promise<void>;
  processAllImages: () => void;
  downloadImage: (index: number) => void;
  downloadAllImages: () => void;
  toggleSelectImage: (index: number) => void;
  selectAllImages: (selected: boolean) => void;
  removeBackground: boolean;
  setRemoveBackground: (value: boolean) => void;
  apiKey: string | null;
  setApiKey: (value: string) => void;
  selfHosted: boolean;
  setSelfHosted: (value: boolean) => void;
  serverUrl: string;
  setServerUrl: (value: string) => void;
  backgroundRemovalModel: string;
  setBackgroundRemovalModel: (value: string) => void;
  backgroundType: string;
  setBackgroundType: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  backgroundOpacity: number;
  setBackgroundOpacity: (value: number) => void;
  backgroundImage: File | null;
  setBackgroundImage: React.Dispatch<React.SetStateAction<File | null>>;
  kollectItApiKey: string | null | undefined;
  setKollectItApiKey: React.Dispatch<React.SetStateAction<string | null>> | undefined;
  kollectItUploadUrl: string | undefined;
  setKollectItUploadUrl: React.Dispatch<React.SetStateAction<string>> | undefined;
  showBeforeAfter: number | null;
  toggleBeforeAfterView: (index: number | null) => void;
  batchProgress: number;
  totalItemsToProcess: number;
  processedItemsCount: number;
  cancelBatchProcessing: () => void;
  clearImageCache: () => void;
  clearAnalyticsData: () => void;
  exportPath: string;
  setExportPath: (path: string) => void;
  // Multi-format options
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;
  compressionSettings: CompressionSettings;
  setCompressionSettings: (settings: CompressionSettings) => void;
  stripMetadata: boolean;
  setStripMetadata: (strip: boolean) => void;
  progressiveLoading: boolean;
  setProgressiveLoading: (progressive: boolean) => void;
  estimatedSizes: {
    original: number;
    jpeg: number | null;
    webp: number | null;
    avif: number | null;
  };
  applyWordPressPreset: (preset: WordPressPreset) => void;
  downloadImageFormat: (imageIndex: number, format: string) => void;
  downloadAllFormats: (imageIndex: number) => void;
  viewHtmlCode: (imageIndex: number) => void;
}
