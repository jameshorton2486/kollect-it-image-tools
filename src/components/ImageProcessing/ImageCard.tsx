
import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Image as ImageIcon, Eye, Loader } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ImageCardProps {
  image: {
    original: File;
    processed: File | null;
    preview: string;
    isProcessing: boolean;
    isSelected: boolean;
    hasBackgroundRemoved: boolean;
    processingProgress?: number;
  };
  index: number;
  showBeforeAfter: boolean;
  onProcess: (index: number) => void;
  onDownload: (index: number) => void;
  onToggleSelect: (index: number) => void;
  onToggleBeforeAfter: (index: number) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  index, 
  showBeforeAfter,
  onProcess, 
  onDownload, 
  onToggleSelect,
  onToggleBeforeAfter
}) => {
  return (
    <Card 
      className={`overflow-hidden ${image.isSelected ? 'ring-2 ring-brand-blue' : ''}`}
    >
      <div className="relative aspect-square">
        {showBeforeAfter ? (
          <div className="grid grid-cols-2 h-full">
            <div className="relative border-r border-gray-200">
              <img 
                src={createObjectUrl(image.original)} 
                alt={`Original ${image.original.name}`} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                Before
              </div>
            </div>
            <div className="relative">
              <img 
                src={image.preview} 
                alt={`Processed ${image.original.name}`} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                After
              </div>
            </div>
          </div>
        ) : (
          <div className="image-preview absolute inset-0">
            <img src={image.preview} alt={`Preview of ${image.original.name}`} />
          </div>
        )}
        
        {image.isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            {image.processingProgress !== undefined ? (
              <>
                <Loader className="h-6 w-6 text-white mb-2 animate-spin" />
                <div className="w-3/4 mb-1">
                  <Progress value={image.processingProgress} className="h-1" />
                </div>
                <div className="text-white text-xs">{image.processingProgress}%</div>
              </>
            ) : (
              <div className="animate-pulse-opacity text-white">Processing...</div>
            )}
          </div>
        )}
        
        {/* Background removed indicator */}
        {image.hasBackgroundRemoved && !image.isProcessing && (
          <Badge 
            className="absolute top-2 right-2" 
            variant="secondary"
          >
            Background Removed
          </Badge>
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
        
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onProcess(index)}
            disabled={image.isProcessing}
            className="w-full"
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Process
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(index)}
            disabled={!image.processed || image.isProcessing}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          {image.processed && (
            <Button
              variant={showBeforeAfter ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleBeforeAfter(index)}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-1" />
              Compare
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to avoid revoking URLs that we need temporarily
const createObjectUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export default ImageCard;
