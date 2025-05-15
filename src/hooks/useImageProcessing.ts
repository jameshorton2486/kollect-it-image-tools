
import { useState, useCallback, useEffect } from 'react';
import { revokeObjectUrl } from '@/utils/imageUtils';
import { initializeProcessedImages } from '@/utils/imageProcessingUtils';
import { ProcessedImage } from '@/types/imageProcessing';
import { UseImageProcessingResult } from './useImageProcessingTypes';
import {
  useImageProcessingState,
  useImageProcessingEffects,
  useImageProcessingActions
} from './useImageProcessingCore';

export type { ProcessedImage } from '@/types/imageProcessing';

export function useImageProcessing(initialImages: File[]): UseImageProcessingResult {
  // Core state management
  const {
    processedImages, setProcessedImages,
    compressionLevel, setCompressionLevel,
    maxWidth, setMaxWidth,
    maxHeight, setMaxHeight,
    preserveAspectRatio, setPreserveAspectRatio,
    isProcessing, setIsProcessing,
    removeBackground, setRemoveBackground,
    apiKey, setApiKey,
    showBeforeAfter, setShowBeforeAfter
  } = useImageProcessingState();

  // Initialize and clean up effects
  useImageProcessingEffects({
    initialImages,
    processedImages,
    apiKey,
    setProcessedImages
  });
  
  // Action methods
  const {
    processImage,
    processAllImages,
    downloadImage,
    downloadAllImages,
    toggleSelectImage,
    selectAllImages,
    toggleBeforeAfterView
  } = useImageProcessingActions({
    processedImages,
    setProcessedImages,
    compressionLevel,
    maxWidth,
    maxHeight,
    removeBackground,
    apiKey,
    isProcessing,
    setIsProcessing,
    setShowBeforeAfter
  });
  
  return {
    processedImages,
    compressionLevel,
    setCompressionLevel,
    maxWidth,
    setMaxWidth,
    maxHeight,
    setMaxHeight,
    preserveAspectRatio,
    setPreserveAspectRatio,
    isProcessing,
    processImage,
    processAllImages,
    downloadImage,
    downloadAllImages,
    toggleSelectImage,
    selectAllImages,
    removeBackground,
    setRemoveBackground,
    apiKey,
    setApiKey,
    showBeforeAfter,
    toggleBeforeAfterView
  };
}
