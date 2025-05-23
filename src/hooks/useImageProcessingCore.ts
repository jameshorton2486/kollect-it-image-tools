
import { useState, useEffect } from 'react';
import { ProcessedImage, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { normalizeProcessedImage } from '@/utils/imageProcessing/batchProcessingHelper';
import { toast } from 'sonner';

interface UseImageProcessingCoreConfig {
  initialCompressionLevel?: number;
  initialMaxWidth?: number;
  initialMaxHeight?: number;
  initialRemoveBackground?: boolean;
  initialApiKey?: string | null;
  initialSelfHosted?: boolean;
  initialServerUrl?: string;
  initialBackgroundRemovalModel?: string;
  initialBackgroundType?: string;
  initialBackgroundColor?: string;
  initialBackgroundOpacity?: number;
  initialOutputFormat?: OutputFormat;
  initialCompressionSettings?: CompressionSettings;
}

const DEFAULT_OUTPUT_FORMAT: OutputFormat = 'webp';

const DEFAULT_COMPRESSION_SETTINGS: CompressionSettings = {
  jpeg: { 
    quality: 80 
  },
  webp: { 
    quality: 80, 
    lossless: false 
  },
  png: { 
    quality: 80 
  },
  avif: { 
    quality: 65
  }
};

export function useImageProcessingCore(initialImages: File[] = []) {
  // Core image state
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Processing settings
  const [compressionLevel, setCompressionLevel] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [maxHeight, setMaxHeight] = useState(1200);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(DEFAULT_OUTPUT_FORMAT);
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>(DEFAULT_COMPRESSION_SETTINGS);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [progressiveLoading, setProgressiveLoading] = useState(true);
  const [resizeMode, setResizeMode] = useState<'fit' | 'fill' | 'crop' | 'scale'>('fit');
  const [resizeQuality, setResizeQuality] = useState(90);
  const [resizeUnit, setResizeUnit] = useState<'px' | '%'>('px');

  // Background removal
  const [removeBackground, setRemoveBackground] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selfHosted, setSelfHosted] = useState(false);
  const [serverUrl, setServerUrl] = useState('https://api.remove.bg/v1.0/removebg');
  const [backgroundRemovalModel, setBackgroundRemovalModel] = useState('u2net');
  const [backgroundType, setBackgroundType] = useState('color');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundOpacity, setBackgroundOpacity] = useState(100);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);

  // Export settings
  const [exportPath, setExportPath] = useState('optimized-images');

  // Batch processing state
  const [batchProgress, setBatchProgress] = useState(0);
  const [totalItemsToProcess, setTotalItemsToProcess] = useState(0);
  const [processedItemsCount, setProcessedItemsCount] = useState(0);
  const [showBeforeAfter, setShowBeforeAfter] = useState<number | null>(null);
  
  // Integration settings
  const [kollectItApiKey, setKollectItApiKey] = useState<string | null>(null);
  const [kollectItUploadUrl, setKollectItUploadUrl] = useState('https://api.kollect-it.com/upload');

  // Initialize processed images array
  useEffect(() => {
    if (initialImages.length > 0) {
      const newProcessedImages = initialImages.map(file => normalizeProcessedImage(file));
      setProcessedImages(newProcessedImages);
    }
  }, []);

  // Estimate file sizes based on current settings
  const estimateImageSizes = () => {
    const firstImage = processedImages[0];
    if (!firstImage) {
      return {
        original: 0,
        jpeg: null,
        webp: null,
        avif: null
      };
    }

    const originalSize = firstImage.originalFile.size;
    
    const jpegRatio = compressionSettings.jpeg.quality / 100 * 0.7;
    const webpRatio = compressionSettings.webp.lossless ? 0.8 : compressionSettings.webp.quality / 100 * 0.5;
    const avifRatio = compressionSettings.avif.quality / 100 * 0.4;
    
    return {
      original: originalSize,
      jpeg: Math.round(originalSize * jpegRatio),
      webp: Math.round(originalSize * webpRatio),
      avif: Math.round(originalSize * avifRatio)
    };
  };

  return {
    // Core image state
    processedImages,
    setProcessedImages,
    isProcessing,
    setIsProcessing,
    
    // Processing settings
    compressionLevel,
    setCompressionLevel,
    maxWidth,
    setMaxWidth, 
    maxHeight,
    setMaxHeight,
    preserveAspectRatio, 
    setPreserveAspectRatio,
    outputFormat,
    setOutputFormat,
    compressionSettings,
    setCompressionSettings,
    stripMetadata,
    setStripMetadata,
    progressiveLoading,
    setProgressiveLoading,
    resizeMode,
    setResizeMode,
    resizeQuality,
    setResizeQuality,
    resizeUnit,
    setResizeUnit,
    
    // Background removal
    removeBackground,
    setRemoveBackground,
    apiKey,
    setApiKey,
    selfHosted,
    setSelfHosted,
    serverUrl,
    setServerUrl,
    backgroundRemovalModel,
    setBackgroundRemovalModel,
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    backgroundOpacity,
    setBackgroundOpacity,
    backgroundImage,
    setBackgroundImage,
    
    // Export settings
    exportPath,
    setExportPath,
    
    // Batch processing state
    batchProgress,
    setBatchProgress,
    totalItemsToProcess,
    setTotalItemsToProcess,
    processedItemsCount,
    setProcessedItemsCount,
    showBeforeAfter,
    setShowBeforeAfter,
    
    // Integration settings
    kollectItApiKey,
    setKollectItApiKey,
    kollectItUploadUrl,
    setKollectItUploadUrl,
    
    // Helper methods
    estimateImageSizes
  };
}
