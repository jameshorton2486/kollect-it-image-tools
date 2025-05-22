
import React from 'react';
import ImageCard from './ImageCard';
import { ProcessedImage } from '@/types/imageProcessing';
import CompressionResultsSection from './CompressionResultsSection';
import FormatSuggestionCard from './SmartFeatures/FormatSuggestionCard';
import ImageResultsCard from './ResultsDashboard/ImageResultsCard';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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
  // Function to determine image type based on its characteristics
  const determineImageType = (image: ProcessedImage): 'photo' | 'graphic' | 'screenshot' | 'unknown' => {
    const mimeType = image.original.type;
    
    // Simple heuristic based on file type
    if (mimeType.includes('png')) {
      // If image has transparency or few colors, likely a graphic
      return 'graphic';
    } 
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      // Most JPEGs are photos
      return 'photo';
    }
    
    return 'unknown';
  };
  
  // Handle copying HTML code to clipboard
  const handleCopyHtml = (index: number) => {
    if (onViewHtmlCode) {
      onViewHtmlCode(index);
    }
  };

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
            
            {/* Enhanced Results Dashboard */}
            {image.processed && (
              <div className="space-y-4">
                {/* Format Suggestion Card */}
                <FormatSuggestionCard 
                  image={image}
                  currentFormat={image.outputFormat || 'jpeg'}
                  imageType={determineImageType(image)}
                />
                
                {/* Results Dashboard */}
                <ImageResultsCard
                  image={image}
                  imageIndex={index}
                  onDownloadFormat={onDownloadFormat || (() => {})}
                  onCopyHtml={handleCopyHtml}
                  processingTime={image.processingTime}
                />
                
                {/* Original Compression Results */}
                {image.compressionStats && onDownloadFormat && onViewHtmlCode && onDownloadAllFormats && (
                  <CompressionResultsSection 
                    image={image} 
                    imageIndex={index}
                    onDownloadFormat={onDownloadFormat}
                    onViewHtmlCode={onViewHtmlCode}
                    onDownloadAllFormats={onDownloadAllFormats}
                  />
                )}
                
                {/* Bulk download button */}
                {image.processedFormats && onDownloadAllFormats && (
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onDownloadAllFormats(index)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Formats (ZIP)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
