
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedImage } from '@/types/imageProcessing';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Download, Copy, Clock, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ImageResultsCardProps {
  image: ProcessedImage;
  onDownloadFormat: (index: number, format: string) => void;
  onCopyHtml: (index: number) => void;
  imageIndex: number;
  processingTime?: number; // in milliseconds
}

const ImageResultsCard: React.FC<ImageResultsCardProps> = ({ 
  image, 
  onDownloadFormat,
  onCopyHtml,
  imageIndex,
  processingTime = 0
}) => {
  const originalSize = image.original?.size || 0;
  const processedSize = image.processed?.size || 0;
  
  // Calculate size reduction percentage
  const sizeReduction = originalSize > 0 && processedSize > 0
    ? Math.round((1 - processedSize / originalSize) * 100)
    : 0;
  
  // Format file sizes for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Get dimensions as string
  const getOriginalDimensions = () => {
    if (image.dimensions) {
      return `${image.dimensions.width}×${image.dimensions.height}px`;
    }
    return 'Unknown';
  };
  
  const getProcessedDimensions = () => {
    // For processed images, we could either get dimensions from the image object
    // or calculate them based on the original dimensions and resize settings
    if (image.dimensions && image.processedDimensions) {
      return `${image.processedDimensions.width}×${image.processedDimensions.height}px`;
    }
    return 'Unknown';
  };
  
  // Get available formats
  const availableFormats = image.processedFormats 
    ? Object.keys(image.processedFormats) 
    : [];

  return (
    <Card className="mb-4">
      <CardHeader className="py-4">
        <CardTitle className="text-lg flex items-center">
          <FileCheck className="w-5 h-5 mr-2 text-green-500" />
          Resizing Results
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Original</TableCell>
              <TableCell>
                {getOriginalDimensions()} ({formatFileSize(originalSize)})
              </TableCell>
            </TableRow>
            
            <TableRow>
              <TableCell className="font-medium">Resized</TableCell>
              <TableCell className="flex items-center gap-2">
                {getProcessedDimensions()} ({formatFileSize(processedSize)})
                {sizeReduction > 0 && (
                  <Badge className="bg-green-100 text-green-800">
                    {sizeReduction}% smaller
                  </Badge>
                )}
              </TableCell>
            </TableRow>
            
            {processingTime > 0 && (
              <TableRow>
                <TableCell className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" /> Processing Time
                </TableCell>
                <TableCell>{(processingTime / 1000).toFixed(2)}s</TableCell>
              </TableRow>
            )}
            
            <TableRow>
              <TableCell className="font-medium">Available Formats</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {availableFormats.map(format => (
                    <Button 
                      key={format}
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownloadFormat(imageIndex, format)}
                      className="flex items-center"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {format.toUpperCase()}
                    </Button>
                  ))}
                  
                  {availableFormats.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopyHtml(imageIndex)}
                      className="flex items-center"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      HTML
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ImageResultsCard;
