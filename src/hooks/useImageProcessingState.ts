
import { useState, useEffect } from 'react';
import { ProcessedImage, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';

/**
 * Hook for managing image processing state
 */
export function useImageProcessingState() {
  // Core image states
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  
  // Compression settings
  const [compressionLevel, setCompressionLevel] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);
  
  // Processing status
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Background removal settings
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(
    localStorage.getItem('removebg_api_key') || null
  );
  const [selfHosted, setSelfHosted] = useState<boolean>(false);
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:5000');
  const [backgroundRemovalModel, setBackgroundRemovalModel] = useState<string>(
    localStorage.getItem('background_removal_model') || 'u2net'
  );
  
  // Background options
  const [backgroundType, setBackgroundType] = useState<string>(
    localStorage.getItem('background_type') || 'transparent'
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    localStorage.getItem('background_color') || '#ffffff'
  );
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(
    parseInt(localStorage.getItem('background_opacity') || '100', 10)
  );
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  
  // UI states
  const [showBeforeAfter, setShowBeforeAfter] = useState<number | null>(null);
  
  // Batch processing progress
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [totalItemsToProcess, setTotalItemsToProcess] = useState<number>(0);
  const [processedItemsCount, setProcessedItemsCount] = useState<number>(0);
  
  // Kollect-It integration
  const [kollectItApiKey, setKollectItApiKey] = useState<string | null>(
    localStorage.getItem('kollect_it_api_key') || null
  );
  const [kollectItUploadUrl, setKollectItUploadUrl] = useState<string>(
    localStorage.getItem('kollect_it_upload_url') || 'https://api.kollect.it/upload'
  );
  
  // WordPress export path
  const [exportPath, setExportPath] = useState<string>(
    localStorage.getItem('export_path') || '/wp-content/uploads/'
  );
  
  // Multi-format options
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('auto');
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    jpeg: { quality: 80 },
    webp: { quality: 80 },
    avif: { quality: 70 }
  });
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  const [progressiveLoading, setProgressiveLoading] = useState<boolean>(true);
  
  // Estimated file sizes (calculated based on settings)
  const [estimatedSizes, setEstimatedSizes] = useState({
    original: 0,
    jpeg: null as number | null,
    webp: null as number | null,
    avif: null as number | null
  });

  // Resize options
  const [resizeMode, setResizeMode] = useState<ResizeMode>('fit');
  const [resizeUnit, setResizeUnit] = useState<ResizeUnit>('px');
  const [resizeQuality, setResizeQuality] = useState<number>(80);

  return {
    processedImages, setProcessedImages,
    compressionLevel, setCompressionLevel,
    maxWidth, setMaxWidth,
    maxHeight, setMaxHeight,
    preserveAspectRatio, setPreserveAspectRatio,
    isProcessing, setIsProcessing,
    removeBackground, setRemoveBackground,
    apiKey, setApiKey,
    selfHosted, setSelfHosted,
    serverUrl, setServerUrl,
    backgroundRemovalModel, setBackgroundRemovalModel,
    backgroundType, setBackgroundType,
    backgroundColor, setBackgroundColor,
    backgroundOpacity, setBackgroundOpacity,
    backgroundImage, setBackgroundImage,
    showBeforeAfter, setShowBeforeAfter,
    batchProgress, setBatchProgress,
    totalItemsToProcess, setTotalItemsToProcess,
    processedItemsCount, setProcessedItemsCount,
    kollectItApiKey, setKollectItApiKey,
    kollectItUploadUrl, setKollectItUploadUrl,
    exportPath, setExportPath,
    // Multi-format options
    outputFormat, setOutputFormat,
    compressionSettings, setCompressionSettings,
    stripMetadata, setStripMetadata,
    progressiveLoading, setProgressiveLoading,
    estimatedSizes, setEstimatedSizes,
    // Resize options
    resizeMode, setResizeMode,
    resizeUnit, setResizeUnit,
    resizeQuality, setResizeQuality
  };
}
