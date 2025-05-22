
import React, { useState } from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import { WORDPRESS_IMAGE_TYPES } from '@/types/wordpressImageTypes';
import { Button } from '@/components/ui/button';
import ImageRenameDialog from './ImageRenameDialog';
import { Badge } from '@/components/ui/badge';
import { FilePenLine, Download, ArrowRightLeft, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImageCardToolbarProps {
  image: ProcessedImage;
  index: number;
  onProcessImage: (index: number) => Promise<void>;
  onDownloadImage: (index: number) => void;
  onToggleBeforeAfterView: (index: number | null) => void;
  onRenameImage: (index: number, newName: string) => void;
  onSetOutputFormat: (index: number, format: string) => void;
  onSetWordPressType: (index: number, typeId: string) => void;
  onRemoveImage: (index: number) => void;
}

const ImageCardToolbar: React.FC<ImageCardToolbarProps> = ({
  image,
  index,
  onProcessImage,
  onDownloadImage,
  onToggleBeforeAfterView,
  onRenameImage,
  onSetOutputFormat,
  onSetWordPressType,
  onRemoveImage
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const wordpressType = WORDPRESS_IMAGE_TYPES.find(type => type.id === image.wordpressType);
  
  return (
    <>
      <div className="flex items-center justify-between p-2 bg-background/80 backdrop-blur-sm">
        <div className="text-xs truncate mr-2">
          {image.newFilename || image.original.name}
          {wordpressType && (
            <Badge variant="outline" className="ml-1 text-xs">
              {wordpressType.name}
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialogOpen(true)}>
                  <FilePenLine className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rename</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => onDownloadImage(index)}
                  disabled={!image.processed}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => onToggleBeforeAfterView(index)}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Before/After</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-destructive" 
                  onClick={() => onRemoveImage(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <ImageRenameDialog 
        fileName={image.newFilename || image.original.name}
        onRename={(newName) => onRenameImage(index, newName)}
        onSetFormat={(format) => onSetOutputFormat(index, format)}
        selectedWordPressType={image.wordpressType}
        onSetWordPressType={(typeId) => onSetWordPressType(index, typeId)}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default ImageCardToolbar;
