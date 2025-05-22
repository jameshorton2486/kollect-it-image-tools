
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ProcessedImage } from '@/types/imageProcessing';
import ImageCardToolbar from './ImageCardToolbar';
import { WORDPRESS_IMAGE_TYPES } from '@/types/wordpressImageTypes';
import { Badge } from '@/components/ui/badge';

interface ImageCardProps {
  image: ProcessedImage;
  index: number;
  showBeforeAfter: boolean;
  onProcessImage: (index: number) => Promise<void>;
  onDownloadImage: (index: number) => void;
  onToggleSelectImage: (index: number) => void;
  onToggleBeforeAfterView: (index: number | null) => void;
  onRenameImage?: (index: number, newName: string) => void;
  onSetOutputFormat?: (index: number, format: string) => void; 
  onSetWordPressType?: (index: number, typeId: string) => void;
  onRemoveImage?: (index: number) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  index,
  showBeforeAfter,
  onProcessImage,
  onDownloadImage,
  onToggleSelectImage,
  onToggleBeforeAfterView,
  onRenameImage = () => {},
  onSetOutputFormat = () => {},
  onSetWordPressType = () => {},
  onRemoveImage = () => {}
}) => {
  // Get WordPress type info if available
  const wpType = image.wordpressType 
    ? WORDPRESS_IMAGE_TYPES.find(t => t.id === image.wordpressType) 
    : undefined;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <div className="absolute top-2 left-2 z-10">
          <Checkbox 
            checked={image.isSelected} 
            onCheckedChange={() => onToggleSelectImage(index)}
          />
        </div>
        
        {image.processed && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Processed
            </Badge>
          </div>
        )}
        
        <div className="relative w-full pt-[100%]">
          {showBeforeAfter ? (
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full relative overflow-hidden">
                <img 
                  src={image.preview} 
                  alt="Original" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Original
                </div>
              </div>
              <div className="w-1/2 h-full relative overflow-hidden">
                <img 
                  src={image.processed ? URL.createObjectURL(image.processed) : image.preview} 
                  alt="Processed" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  Processed
                </div>
              </div>
            </div>
          ) : (
            <img 
              src={image.processed ? URL.createObjectURL(image.processed) : image.preview} 
              alt={image.original.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {image.isProcessing && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto">
        {/* WordPress type info if available */}
        {wpType && (
          <div className="px-2 py-1 bg-muted/30">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium">{wpType.name}</span>
              <span>{wpType.recommendedSize}</span>
            </div>
          </div>
        )}
        
        {/* Card toolbar with rename and other operations */}
        <ImageCardToolbar 
          image={image}
          index={index}
          onProcessImage={onProcessImage}
          onDownloadImage={onDownloadImage}
          onToggleBeforeAfterView={onToggleBeforeAfterView}
          onRenameImage={onRenameImage}
          onSetOutputFormat={onSetOutputFormat}
          onSetWordPressType={onSetWordPressType}
          onRemoveImage={onRemoveImage}
        />
      </div>
      
      <CardContent className="p-3 pt-1">
        {/* Status Message */}
        {image.processingError && (
          <div className="text-xs text-destructive mt-1">{image.processingError}</div>
        )}
        
        {/* File info */}
        <div className="text-xs text-muted-foreground mt-1">
          {image.original.type} · {(image.original.size / 1024).toFixed(1)} KB
          {image.processed && (
            <span> → {(image.processed.size / 1024).toFixed(1)} KB ({Math.round((1 - image.processed.size / image.original.size) * 100)}% smaller)</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
