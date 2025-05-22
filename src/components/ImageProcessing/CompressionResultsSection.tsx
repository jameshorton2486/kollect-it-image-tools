
import React from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileCode, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CompressionResultsSectionProps {
  image: ProcessedImage;
  onDownloadFormat: (imageIndex: number, format: string) => void;
  imageIndex: number;
  onViewHtmlCode: (imageIndex: number) => void;
  onDownloadAllFormats: (imageIndex: number) => void;
}

const CompressionResultsSection: React.FC<CompressionResultsSectionProps> = ({
  image,
  onDownloadFormat,
  imageIndex,
  onViewHtmlCode,
  onDownloadAllFormats
}) => {
  if (!image.compressionStats) {
    return null;
  }

  const { originalSize, formatSizes, qualityScores, processingTimes } = image.compressionStats;
  const formats = ['jpeg', 'webp', 'avif'] as const;

  // Calculate which format has the best compression
  const bestFormat = formats.reduce((best, format) => {
    if (!formatSizes[format]) return best;
    if (!best || formatSizes[format]! < formatSizes[best]!) return format;
    return best;
  }, null as null | typeof formats[number]);

  // Calculate which format has the highest quality score
  const bestQualityFormat = formats.reduce((best, format) => {
    if (!qualityScores || !qualityScores[format]) return best;
    if (!best || qualityScores[format]! > qualityScores[best]!) return format;
    return best;
  }, null as null | typeof formats[number]);

  const formatBrowserSupport = {
    jpeg: '100%',
    webp: '96.45%',
    avif: '79.15%'
  };

  const formatIcons = {
    jpeg: '🖼️',
    webp: '🌐',
    avif: '✨'
  };

  const getCompressionScore = (originalSize: number, compressedSize: number): number => {
    const ratio = 1 - compressedSize / originalSize;
    // Convert to a 0-100 score where 0.7+ reduction is 100, 0 reduction is 0
    return Math.min(100, Math.round((ratio / 0.7) * 100));
  };

  const formatName = (format: string): string => {
    switch (format) {
      case 'jpeg': return 'JPEG';
      case 'webp': return 'WebP';
      case 'avif': return 'AVIF';
      default: return format.toUpperCase();
    }
  };

  return (
    <div className="border rounded-md p-4 bg-white/50 space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Multi-Format Compression Results</h3>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewHtmlCode(imageIndex)}
                  className="flex gap-1 items-center h-7"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span className="text-xs">HTML Code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                <p>Generate WordPress HTML code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDownloadAllFormats(imageIndex)}
                  className="flex gap-1 items-center h-7"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="text-xs">All Formats</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                <p>Download all image formats</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Format</TableHead>
              <TableHead className="text-right">Original Size</TableHead>
              <TableHead className="text-right">Compressed Size</TableHead>
              <TableHead className="text-right">Reduction %</TableHead>
              <TableHead className="text-right">Quality Score</TableHead>
              <TableHead className="text-right">Browser Support</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formats.map((format) => {
              if (!formatSizes[format]) return null;
              
              const size = formatSizes[format]!;
              const reductionPercent = Math.round((1 - size / originalSize) * 100);
              const isBestSize = bestFormat === format;
              const isBestQuality = bestQualityFormat === format;
              
              return (
                <TableRow key={format} className={isBestSize ? 'bg-green-50' : undefined}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      <span>{formatIcons[format]}</span>
                      <span>{formatName(format)}</span>
                      {isBestSize && (
                        <Badge variant="default" className="text-[10px] ml-1">Best Size</Badge>
                      )}
                      {isBestQuality && !isBestSize && (
                        <Badge variant="secondary" className="text-[10px] ml-1">Best Quality</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{(originalSize / 1024).toFixed(1)} KB</TableCell>
                  <TableCell className="text-right">{(size / 1024).toFixed(1)} KB</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={reductionPercent} className="w-16 h-2" />
                      <span>{reductionPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {qualityScores?.[format] ? `${qualityScores[format]}/100` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">{formatBrowserSupport[format]}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDownloadFormat(imageIndex, format)}
                      className="h-7 px-2"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="pt-2 text-xs text-muted-foreground">
        <p>
          Processing time: {
            processingTimes ? 
            `JPEG: ${processingTimes.jpeg?.toFixed(2) || 'N/A'}s, 
            WebP: ${processingTimes.webp?.toFixed(2) || 'N/A'}s, 
            AVIF: ${processingTimes.avif?.toFixed(2) || 'N/A'}s` : 
            'N/A'
          }
        </p>
      </div>
    </div>
  );
};

export default CompressionResultsSection;
