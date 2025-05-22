
import React from 'react';
import ImageCard from './ImageCard';
import { ProcessedImage } from '@/types/imageProcessing';
import CompressionResultsSection from './CompressionResultsSection';

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
  onDownloadFormat?: (index: number, format: string) => void;
  onViewHtmlCode?: (index: number) => void;
  onDownloadAllFormats?: (index: number) => void;
  onImageSelect?: (image: ProcessedImage) => void;
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
  onRemoveImage,
  onDownloadFormat,
  onViewHtmlCode,
  onDownloadAllFormats,
  onImageSelect
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="space-y-2"
            onClick={() => onImageSelect && onImageSelect(image)}
          >
            <ImageCard 
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
            
            {/* Show compression results if available */}
            {image.compressionStats && onDownloadFormat && onViewHtmlCode && onDownloadAllFormats && (
              <CompressionResultsSection 
                image={image} 
                imageIndex={index}
                onDownloadFormat={onDownloadFormat}
                onViewHtmlCode={onViewHtmlCode}
                onDownloadAllFormats={onDownloadAllFormats}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
