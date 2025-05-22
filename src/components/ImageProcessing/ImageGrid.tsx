
import React from 'react';
import ImageCard from './ImageCard';
import { ProcessedImage } from '@/types/imageProcessing';

interface ImageGridProps {
  images: ProcessedImage[];
  showBeforeAfterIndex: number | null;
  onProcessImage: (index: number) => Promise<void>;
  onDownloadImage: (index: number) => void;
  onToggleSelectImage: (index: number) => void;
  onToggleBeforeAfterView: (index: number | null) => void;
  onRenameImage?: (index: number, newName: string) => void;
  onSetOutputFormat?: (index: number, format: string) => void;
  onSetWordPressType?: (index: number, typeId: string) => void;
  onRemoveImage?: (index: number) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  showBeforeAfterIndex,
  onProcessImage,
  onDownloadImage,
  onToggleSelectImage,
  onToggleBeforeAfterView,
  onRenameImage,
  onSetOutputFormat,
  onSetWordPressType,
  onRemoveImage
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <ImageCard 
          key={index} 
          image={image} 
          index={index} 
          showBeforeAfter={showBeforeAfterIndex === index}
          onProcessImage={onProcessImage}
          onDownloadImage={onDownloadImage}
          onToggleSelectImage={onToggleSelectImage}
          onToggleBeforeAfterView={onToggleBeforeAfterView}
          onRenameImage={onRenameImage}
          onSetOutputFormat={onSetOutputFormat}
          onSetWordPressType={onSetWordPressType}
          onRemoveImage={onRemoveImage}
        />
      ))}
    </div>
  );
};

export default ImageGrid;
