
import { ProcessedImage, WordPressPreset, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';

/**
 * Type definition for the result of useImageProcessing hook
 */
export interface UseImageProcessingResult {
  // Core image states
  processedImages: ProcessedImage[];
  setProcessedImages: React.Dispatch<React.SetStateAction<ProcessedImage[]>>;
  
  // Compression settings
  compressionLevel: number;
  setCompressionLevel: (value: number) => void;
  maxWidth: number;
  setMaxWidth: (value: number) => void;
  maxHeight: number;
  setMaxHeight: (value: number) => void;
  preserveAspectRatio: boolean;
  setPreserveAspectRatio: (value: boolean) => void;
  
  // Processing status
  isProcessing: boolean;
  
  // Actions
  processImage: (index: number) => Promise<void>;
  processAllImages: () => Promise<void>;
  downloadImage: (index: number) => void;
  downloadAllImages: () => void;
  toggleSelectImage: (index: number) => void;
  selectAllImages: (selected: boolean) => void;
  
  // Background removal settings
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
  
  // Background options
  backgroundType: string;
  setBackgroundType: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  backgroundOpacity: number;
  setBackgroundOpacity: (value: number) => void;
  backgroundImage: File | null;
  setBackgroundImage: React.Dispatch<React.SetStateAction<File | null>>;
  
  // Kollect-It integration
  kollectItApiKey: string | null;
  setKollectItApiKey: React.Dispatch<React.SetStateAction<string | null>>;
  kollectItUploadUrl: string;
  setKollectItUploadUrl: React.Dispatch<React.SetStateAction<string>>;
  
  // UI states  
  showBeforeAfter: number | null;
  toggleBeforeAfterView: (index: number | null) => void;
  
  // Batch processing
  batchProgress: number;
  totalItemsToProcess: number;
  processedItemsCount: number;
  cancelBatchProcessing: () => void;
  
  // System operations
  clearImageCache: () => void;
  clearAnalyticsData: () => void;
  
  // WordPress file export
  exportPath: string;
  setExportPath: React.Dispatch<React.SetStateAction<string>>;

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

  // Resize options
  resizeMode: ResizeMode;
  setResizeMode: (mode: ResizeMode) => void;
  resizeUnit: ResizeUnit;
  setResizeUnit: (unit: ResizeUnit) => void;
  resizeQuality: number;
  setResizeQuality: (quality: number) => void;
  applyResizePreset: (presetKey: string) => void;
}
