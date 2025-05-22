
import { useState, useEffect } from 'react';
import { ProcessedImage, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { DEFAULT_BACKGROUND_REMOVAL_MODEL } from '@/utils/backgroundRemovalModels';

/**
 * Core state hook for image processing
 */
export function useImageProcessingState() {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1200);
  const [maxHeight, setMaxHeight] = useState<number>(1200);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(localStorage.getItem('removebg_api_key'));
  const [selfHosted, setSelfHosted] = useState<boolean>(localStorage.getItem('rembg_self_hosted') === 'true');
  const [serverUrl, setServerUrl] = useState<string>(localStorage.getItem('rembg_server_url') || 'http://localhost:5000/remove-bg');
  const [showBeforeAfter, setShowBeforeAfter] = useState<number | null>(null);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [totalItemsToProcess, setTotalItemsToProcess] = useState<number>(0);
  const [processedItemsCount, setProcessedItemsCount] = useState<number>(0);
  const [backgroundRemovalModel, setBackgroundRemovalModel] = useState<string>(
    localStorage.getItem('background_removal_model') || DEFAULT_BACKGROUND_REMOVAL_MODEL
  );
  
  // Background options
  const [backgroundType, setBackgroundType] = useState<string>(
    localStorage.getItem('background_type') || 'none'
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    localStorage.getItem('background_color') || '#FFFFFF'
  );
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(
    parseInt(localStorage.getItem('background_opacity') || '100', 10)
  );
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  
  // New state for Kollect-It platform integration
  const [kollectItApiKey, setKollectItApiKey] = useState<string | null>(
    localStorage.getItem('kollect_it_api_key')
  );
  const [kollectItUploadUrl, setKollectItUploadUrl] = useState<string>(
    localStorage.getItem('kollect_it_upload_url') || 'https://api.kollect-it.com/upload'
  );

  // New state for WordPress image types and file management
  const [exportPath, setExportPath] = useState<string>(
    localStorage.getItem('export_path') || 'wp-content/uploads/images'
  );
  
  // New multi-format compression state
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    (localStorage.getItem('output_format') as OutputFormat) || 'auto'
  );
  
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>({
    jpeg: {
      quality: parseInt(localStorage.getItem('jpeg_quality') || '80', 10),
    },
    webp: {
      quality: parseInt(localStorage.getItem('webp_quality') || '75', 10),
      lossless: localStorage.getItem('webp_lossless') === 'true',
    },
    avif: {
      quality: parseInt(localStorage.getItem('avif_quality') || '70', 10),
      lossless: localStorage.getItem('avif_lossless') === 'true',
    }
  });
  
  const [stripMetadata, setStripMetadata] = useState<boolean>(
    localStorage.getItem('strip_metadata') !== 'false'
  );
  
  const [progressiveLoading, setProgressiveLoading] = useState<boolean>(
    localStorage.getItem('progressive_loading') === 'true'
  );
  
  const [estimatedSizes, setEstimatedSizes] = useState<{
    original: number;
    jpeg: number | null;
    webp: number | null;
    avif: number | null;
  }>({
    original: 0,
    jpeg: null,
    webp: null,
    avif: null
  });
  
  // Save new settings to localStorage
  useEffect(() => {
    // Save output format settings
    localStorage.setItem('output_format', outputFormat);
    localStorage.setItem('jpeg_quality', compressionSettings.jpeg.quality.toString());
    localStorage.setItem('webp_quality', compressionSettings.webp.quality.toString());
    localStorage.setItem('avif_quality', compressionSettings.avif.quality.toString());
    localStorage.setItem('webp_lossless', compressionSettings.webp.lossless ? 'true' : 'false');
    localStorage.setItem('avif_lossless', compressionSettings.avif.lossless ? 'true' : 'false');
    localStorage.setItem('strip_metadata', stripMetadata ? 'true' : 'false');
    localStorage.setItem('progressive_loading', progressiveLoading ? 'true' : 'false');
  }, [outputFormat, compressionSettings, stripMetadata, progressiveLoading]);

  // Update estimated file sizes when compression settings change
  useEffect(() => {
    if (!processedImages.length) return;
    
    // Get a sample image to calculate estimated sizes
    const sampleImage = processedImages.find(img => img.original.size > 0);
    if (!sampleImage) return;
    
    const originalSize = sampleImage.original.size;
    
    // Estimate JPEG size based on quality
    const jpegEstimatedSize = Math.max(
      originalSize * (1 - (compressionSettings.jpeg.quality / 120)),
      originalSize * 0.3 // Minimum 30% of original
    );
    
    // Estimate WebP size (typically 25-35% smaller than JPEG at same quality)
    const webpEstimatedSize = Math.max(
      jpegEstimatedSize * (compressionSettings.webp.lossless ? 0.9 : 0.7),
      originalSize * 0.2 // Minimum 20% of original
    );
    
    // Estimate AVIF size (typically 40-50% smaller than JPEG at same quality)
    const avifEstimatedSize = Math.max(
      jpegEstimatedSize * (compressionSettings.avif.lossless ? 0.8 : 0.5),
      originalSize * 0.15 // Minimum 15% of original
    );
    
    setEstimatedSizes({
      original: originalSize,
      jpeg: Math.round(jpegEstimatedSize),
      webp: Math.round(webpEstimatedSize),
      avif: Math.round(avifEstimatedSize)
    });
  }, [processedImages, compressionSettings]);

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
    showBeforeAfter, setShowBeforeAfter,
    batchProgress, setBatchProgress,
    totalItemsToProcess, setTotalItemsToProcess,
    processedItemsCount, setProcessedItemsCount,
    backgroundRemovalModel, setBackgroundRemovalModel,
    backgroundType, setBackgroundType,
    backgroundColor, setBackgroundColor,
    backgroundOpacity, setBackgroundOpacity,
    backgroundImage, setBackgroundImage,
    kollectItApiKey, setKollectItApiKey,
    kollectItUploadUrl, setKollectItUploadUrl,
    exportPath, setExportPath,
    // New multi-format options
    outputFormat, setOutputFormat,
    compressionSettings, setCompressionSettings,
    stripMetadata, setStripMetadata,
    progressiveLoading, setProgressiveLoading,
    estimatedSizes, setEstimatedSizes
  };
}
