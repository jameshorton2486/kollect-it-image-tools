
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, Download, Check, FileImage, Ban } from "lucide-react";
import { ProcessedImage } from '@/types/imageProcessing';
import { formatBytes } from '@/utils/imageUtils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ImageResultsCardProps {
  image: ProcessedImage;
  imageIndex: number;
  onDownloadFormat: (index: number, format: string) => void;
  onCopyHtml: (index: number) => void;
  processingTime?: number;
}

const ImageResultsCard: React.FC<ImageResultsCardProps> = ({ 
  image, 
  imageIndex, 
  onDownloadFormat,
  onCopyHtml,
  processingTime
}) => {
  const [copied, setCopied] = React.useState(false);
  const stats = React.useMemo(() => {
    if (!image.compressionStats) return null;
    
    // Get total saved size
    const originalSize = image.compressionStats.originalSize || 0;
    const outputSizes = Object.values(image.compressionStats.formatSizes || {});
    const smallestOutputSize = outputSizes.length > 0 ? Math.min(...outputSizes) : originalSize;
    
    // Calculate savings
    const savedBytes = originalSize - smallestOutputSize;
    const savingsPercentage = originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;
    
    return {
      originalSize,
      smallestOutputSize,
      savedBytes,
      savingsPercentage,
      availableFormats: Object.keys(image.compressionStats.formatSizes || {})
    };
  }, [image]);
  
  // Handle copy HTML button
  const handleCopyHtml = () => {
    onCopyHtml(imageIndex);
    setCopied(true);
    toast.success("HTML snippet copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  if (!stats) return null;

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="py-3 bg-muted/20">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Optimization Results</span>
          {processingTime && (
            <span className="text-xs text-sage-gray">{(processingTime / 1000).toFixed(2)}s</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Results Stats */}
        <div className="grid grid-cols-2 gap-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="p-2 border border-border rounded-md"
          >
            <div className="text-xs text-sage-gray">Original Size</div>
            <div className="font-medium">{formatBytes(stats.originalSize)}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-2 border border-border rounded-md"
          >
            <div className="text-xs text-sage-gray">Optimized Size</div>
            <div className="font-medium">{formatBytes(stats.smallestOutputSize)}</div>
          </motion.div>
        </div>
        
        {/* Savings Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-sage-gray">
            <span>Size Reduction</span>
            <span className="font-medium text-success-green">
              {Math.round(stats.savingsPercentage)}% saved
            </span>
          </div>
          <div className="h-2 w-full bg-muted/70 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100, stats.savingsPercentage)}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-success-green"
            />
          </div>
          <div className="text-xs text-sage-gray">
            Saved {formatBytes(stats.savedBytes)}
          </div>
        </div>
        
        {/* Available Formats */}
        {stats.availableFormats.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-sage-gray">Available Formats</div>
            <div className="flex flex-wrap gap-1">
              {stats.availableFormats.map(format => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex items-center gap-1"
                  onClick={() => onDownloadFormat(imageIndex, format)}
                >
                  <FileImage className="h-3 w-3" />
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-2"
            onClick={handleCopyHtml}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="h-3 w-3" />
                Copy HTML
              </>
            )}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="text-xs"
            onClick={() => onDownloadFormat(imageIndex, stats.availableFormats[0] || 'jpeg')}
          >
            <Download className="h-3 w-3 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageResultsCard;
