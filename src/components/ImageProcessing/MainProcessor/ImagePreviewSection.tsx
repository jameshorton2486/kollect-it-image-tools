
import React, { useState, useEffect } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import ResizePreviewSection from '../ResizePreviewSection';

interface ImagePreviewSectionProps {
  processedImages: ProcessedImage[];
  maxWidth: number;
  maxHeight: number;
  setMaxWidth: (value: number) => void;
  setMaxHeight: (value: number) => void;
}

const ImagePreviewSection: React.FC<ImagePreviewSectionProps> = ({
  processedImages,
  maxWidth,
  maxHeight,
  setMaxWidth,
  setMaxHeight
}) => {
  const [selectedImageForPreview, setSelectedImageForPreview] = useState<ProcessedImage | null>(null);
  const [originalImageWidth, setOriginalImageWidth] = useState<number>(0);
  const [originalImageHeight, setOriginalImageHeight] = useState<number>(0);

  // Handler for image selection
  const handleImageSelect = (image: ProcessedImage) => {
    setSelectedImageForPreview(image);
    
    // Get original dimensions from image if available
    if (image.dimensions) {
      setOriginalImageWidth(image.dimensions.width);
      setOriginalImageHeight(image.dimensions.height);
    } else {
      // If dimensions aren't available, load them from the original image
      const img = new Image();
      img.onload = () => {
        setOriginalImageWidth(img.width);
        setOriginalImageHeight(img.height);
      };
      img.src = image.preview;
    }
  };

  // Reset dimensions to original
  const handleResetDimensions = () => {
    if (originalImageWidth && originalImageHeight) {
      setMaxWidth(originalImageWidth);
      setMaxHeight(originalImageHeight);
    }
  };

  // Select the first image for preview by default, if available
  useEffect(() => {
    if (processedImages.length > 0 && !selectedImageForPreview) {
      handleImageSelect(processedImages[0]);
    }
  }, [processedImages, selectedImageForPreview]);

  if (!selectedImageForPreview) {
    return null;
  }

  return (
    <ResizePreviewSection 
      selectedImage={selectedImageForPreview}
      originalWidth={originalImageWidth}
      originalHeight={originalImageHeight}
      resizedWidth={maxWidth}
      resizedHeight={maxHeight}
      onWidthChange={setMaxWidth}
      onHeightChange={setMaxHeight}
      onResetDimensions={handleResetDimensions}
    />
  );
};

export default ImagePreviewSection;
