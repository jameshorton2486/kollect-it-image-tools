
import React from 'react';
import ImageCard from './ImageCard';

interface ProcessedImage {
  original: File;
  processed: File | null;
  preview: string;
  isProcessing: boolean;
  isSelected: boolean;
}

interface ImageGridProps {
  images: ProcessedImage[];
  onProcessImage: (index: number) => void;
  onDownloadImage: (index: number) => void;
  onToggleSelectImage: (index: number) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onProcessImage,
  onDownloadImage,
  onToggleSelectImage
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img, index) => (
        <ImageCard
          key={index}
          image={img}
          index={index}
          onProcess={onProcessImage}
          onDownload={onDownloadImage}
          onToggleSelect={onToggleSelectImage}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
