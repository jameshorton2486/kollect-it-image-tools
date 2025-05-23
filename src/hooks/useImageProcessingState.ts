
import { useState } from 'react';
import { ProcessedImage, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';

/**
 * Hook for managing image processing state
 */
export function useImageProcessingState() {
  // Core state
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState<number | null>(null);
  const [exportPath, setExportPath] = useState<string>('');
  
  // Basic settings
  const [compressionLevel, setCompressionLevel] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);
  
  // Background removal settings
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('removebg_api_key') : null
  );
  const [selfHosted, setSelfHosted] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('rembg_self_hosted') === 'true' : false
  );
  const [serverUrl, setServerUrl] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('rembg_server_url') || 'http://localhost:5000' : 'http://localhost:5000'
  );
  const [backgroundRemovalModel, setBackgroundRemovalModel] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('background_removal_model') || 'u2net' : 'u2net'
  );
  const [backgroundType, setBackgroundType] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('background_type') || 'transparent' : 'transparent'
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('background_color') || '#ffffff' : '#ffffff'
  );
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(
    typeof window !== 'undefined' ? parseFloat(localStorage.getItem('background_opacity') || '1') : 1
  );
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  
  // Kollect-It integration settings
  const [kollectItApiKey, setKollectItApiKey] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('kollect_it_api_key') : null
  );
  const [kollectItUploadUrl, setKollectItUploadUrl] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('kollect_it_upload_url') || '' : ''
  );
  
  // Output format settings - initialize as 'single' type
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('single' as OutputFormat);
  
  // Compression settings for each format - add missing lossless properties
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    jpeg: { quality: 80, lossless: false },
    webp: { quality: 80, lossless: false },
    png: { quality: 80, lossless: false },
    avif: { quality: 80, lossless: false }
  });
  
  // Additional processing options
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  const [progressiveLoading, setProgressiveLoading] = useState<boolean>(true);
  
  // Resize options - updated to match the ResizeMode and ResizeUnit types
  const [resizeMode, setResizeMode] = useState<ResizeMode>('fit');
  const [resizeUnit, setResizeUnit] = useState<ResizeUnit>('px');
  const [resizeQuality, setResizeQuality] = useState<number>(80);
  
  // Mock function for estimated sizes
  const estimateImageSizes = () => ({
    original: 0,
    jpeg: null as number | null,
    webp: null as number | null,
    avif: null as number | null
  });

  return {
    // Core state
    processedImages,
    setProcessedImages,
    isProcessing,
    setIsProcessing,
    showBeforeAfter,
    setShowBeforeAfter,
    exportPath,
    setExportPath,
    
    // Basic settings
    compressionLevel,
    setCompressionLevel,
    maxWidth,
    setMaxWidth,
    maxHeight,
    setMaxHeight,
    preserveAspectRatio,
    setPreserveAspectRatio,
    
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
    
    // Kollect-It integration
    kollectItApiKey,
    setKollectItApiKey,
    kollectItUploadUrl,
    setKollectItUploadUrl,
    
    // Output formats
    outputFormat,
    setOutputFormat,
    compressionSettings,
    setCompressionSettings,
    stripMetadata,
    setStripMetadata,
    progressiveLoading,
    setProgressiveLoading,
    
    // Resize options
    resizeMode,
    setResizeMode,
    resizeUnit,
    setResizeUnit,
    resizeQuality,
    setResizeQuality,
    
    // Utility functions
    estimateImageSizes
  };
}
