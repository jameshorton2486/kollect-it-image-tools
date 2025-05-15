
import React from 'react';
import ImageCard from './ImageCard';

interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
  hasBackgroundRemoved: boolean;
}

interface ImageGridProps {
  images: ProcessedImage[];
  showBeforeAfterIndex: number | null;
  onProcessImage: (index: number) => void;
  onDownloadImage: (index: number) => void;
  onToggleSelectImage: (index: number) => void;
  onToggleBeforeAfterView: (index: number) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  showBeforeAfterIndex,
  onProcessImage,
  onDownloadImage,
  onToggleSelectImage,
  onToggleBeforeAfterView
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img, index) => (
        <ImageCard
          key={index}
          image={img}
          index={index}
          showBeforeAfter={showBeforeAfterIndex === index}
          onProcess={onProcessImage}
          onDownload={onDownloadImage}
          onToggleSelect={onToggleSelectImage}
          onToggleBeforeAfter={onToggleBeforeAfterView}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
