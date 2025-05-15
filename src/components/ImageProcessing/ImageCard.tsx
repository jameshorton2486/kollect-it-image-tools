
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Image as ImageIcon } from 'lucide-react';

interface ImageCardProps {
  image: {
    original: File;
    processed: File | null;
    preview: string;
    isProcessing: boolean;
    isSelected: boolean;
  };
  index: number;
  onProcess: (index: number) => void;
  onDownload: (index: number) => void;
  onToggleSelect: (index: number) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  index, 
  onProcess, 
  onDownload, 
  onToggleSelect 
}) => {
  return (
    <Card 
      className={`overflow-hidden ${image.isSelected ? 'ring-2 ring-brand-blue' : ''}`}
    >
      <div className="relative aspect-square">
        <div className="image-preview absolute inset-0">
          <img src={image.preview} alt={`Preview of ${image.original.name}`} />
        </div>
        
        {image.isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-pulse-opacity text-white">Processing...</div>
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-500 truncate" title={image.original.name}>
            {image.original.name}
          </div>
          <Checkbox
            checked={image.isSelected}
            onCheckedChange={() => onToggleSelect(index)}
          />
        </div>
        
        <div className="text-xs text-gray-500 mb-3">
          {image.processed ? (
            <div className="flex justify-between">
              <span>Original: {(image.original.size / 1024).toFixed(1)} KB</span>
              <span>New: {(image.processed.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : (
            <span>Size: {(image.original.size / 1024).toFixed(1)} KB</span>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="w-1/2 mr-1"
            onClick={() => onProcess(index)}
            disabled={image.isProcessing}
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Process
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-1/2 ml-1"
            onClick={() => onDownload(index)}
            disabled={!image.processed || image.isProcessing}
          >
            <Download className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;
