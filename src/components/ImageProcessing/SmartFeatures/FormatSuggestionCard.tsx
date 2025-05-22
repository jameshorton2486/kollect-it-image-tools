
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessedImage } from '@/types/imageProcessing';
import { Table, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { InfoIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FormatSuggestionCardProps {
  image: ProcessedImage | null;
  currentFormat: string;
  imageType: 'photo' | 'graphic' | 'screenshot' | 'unknown';
}

const FormatSuggestionCard: React.FC<FormatSuggestionCardProps> = ({ 
  image, 
  currentFormat,
  imageType = 'unknown'
}) => {
  if (!image) return null;
  
  const fileSize = image.original?.size || 0;
  const fileSizeKB = Math.round(fileSize / 1024);
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  
  // Determine the best format based on image type
  const getBestFormat = () => {
    switch (imageType) {
      case 'photo':
        return { 
          format: 'webp', 
          reason: 'Best for photos with good compression and quality balance'
        };
      case 'graphic':
        return { 
          format: 'png', 
          reason: 'Preserves sharp lines and transparency in graphics'
        };
      case 'screenshot':
        return { 
          format: 'webp', 
          reason: 'Good balance of quality and file size for screenshots'
        };
      default:
        // Fallback to a smart guess based on size
        return fileSize > 1024 * 1024 ? 
          { format: 'webp', reason: 'Recommended for large images to reduce file size' } :
          { format: 'jpeg', reason: 'Good general-purpose format with wide compatibility' };
    }
  };
  
  const bestFormat = getBestFormat();
  const isUsingRecommended = currentFormat === bestFormat.format;
  
  // Size warnings
  const getSizeWarning = () => {
    if (fileSize > 2 * 1024 * 1024) {
      return {
        type: 'warning',
        message: 'Image is very large. Consider resizing or using WebP/AVIF format.'
      };
    } else if (fileSize < 10 * 1024) {
      return {
        type: 'info',
        message: 'Image is very small. Further compression may not be needed.'
      };
    }
    return null;
  };
  
  const sizeWarning = getSizeWarning();
  
  return (
    <Card className="mb-4">
      <CardHeader className="py-4">
        <CardTitle className="text-lg flex items-center">
          <InfoIcon className="w-5 h-5 mr-2 text-blue-500" />
          Smart Format Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Current Format</TableCell>
              <TableCell>
                <Badge variant="outline">{currentFormat.toUpperCase()}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Recommended Format</TableCell>
              <TableCell className="flex items-center">
                <Badge 
                  variant={isUsingRecommended ? "success" : "outline"}
                  className={isUsingRecommended ? "bg-green-100 text-green-800" : ""}
                >
                  {bestFormat.format.toUpperCase()}
                </Badge>
                {isUsingRecommended && (
                  <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Recommendation Reason</TableCell>
              <TableCell>{bestFormat.reason}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Current Size</TableCell>
              <TableCell>
                {fileSizeKB > 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`}
                {sizeWarning && (
                  <div className="flex items-center mt-1 text-sm">
                    <AlertTriangle 
                      className={`w-4 h-4 mr-1 ${
                        sizeWarning.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                      }`} 
                    />
                    {sizeWarning.message}
                  </div>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FormatSuggestionCard;
