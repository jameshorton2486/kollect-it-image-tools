
import { useState } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
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
    exportPath, setExportPath
  };
}
