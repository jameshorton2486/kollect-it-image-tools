
import React from 'react';
import CompressionSettings from './ImageProcessing/CompressionSettings';
import ImageGrid from './ImageProcessing/ImageGrid';
import EmptyState from './ImageProcessing/EmptyState';
import { useImageProcessing } from '@/hooks/useImageProcessing';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
  const {
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
    selectAllImages
  } = useImageProcessing(images);
  
  return (
    <div className="space-y-6">
      <CompressionSettings
        compressionLevel={compressionLevel}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        preserveAspectRatio={preserveAspectRatio}
        isProcessing={isProcessing}
        onCompressionLevelChange={setCompressionLevel}
        onMaxWidthChange={setMaxWidth}
        onMaxHeightChange={setMaxHeight}
        onPreserveAspectRatioChange={setPreserveAspectRatio}
        onProcessAll={processAllImages}
        onDownloadAll={downloadAllImages}
        onSelectAll={selectAllImages}
        onReset={onReset}
      />
      
      {processedImages.length > 0 ? (
        <ImageGrid
          images={processedImages}
          onProcessImage={processImage}
          onDownloadImage={downloadImage}
          onToggleSelectImage={toggleSelectImage}
        />
      ) : (
        <EmptyState onReset={onReset} />
      )}
    </div>
  );
};

export default ImageProcessor;
