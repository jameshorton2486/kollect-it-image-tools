
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProcessorHeader from './ProcessorHeader';
import ProcessingTabs from './ProcessingTabs';
import ProcessorBody from './ProcessorBody';
import BatchProcessingProgress from '@/components/ImageProcessing/BatchProcessingProgress';
import EmptyState from '@/components/ImageProcessing/EmptyState';
import { ImageProcessorProps, ProcessedImage } from '@/types/imageProcessing';
import { clearImageCache } from '@/utils/imageCacheUtils';
import { clearAnalyticsData } from '@/utils/analytics';
import { normalizeProcessedImage } from '@/utils/imageProcessing/batchProcessingHelper';
import { useToast } from '@/hooks/use-toast';

const MainProcessor: React.FC<ImageProcessorProps> = ({ images, onReset, onProcessingStateChange }) => {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const { toast } = useToast();

  // Initialize with uploaded images
  useEffect(() => {
    if (images && images.length > 0) {
      const normalizedImages = images.map(img => normalizeProcessedImage(img));
      setProcessedImages(normalizedImages);
    }
  }, [images]);

  // Report processing state changes to parent
  useEffect(() => {
    if (onProcessingStateChange) {
      onProcessingStateChange(isProcessing);
    }
  }, [isProcessing, onProcessingStateChange]);

  // Handle clearing the cache
  const handleClearCache = () => {
    clearImageCache();
    toast({
      title: "Cache cleared",
      description: "Image cache has been successfully cleared.",
      duration: 3000,
    });
  };

  // Handle clearing analytics data
  const handleClearAnalytics = () => {
    clearAnalyticsData();
    toast({
      title: "Analytics reset",
      description: "Analytics data has been reset successfully.",
      duration: 3000,
    });
  };

  // Handle canceling batch processing
  const handleCancelProcessing = () => {
    setIsProcessing(false);
    setBatchProgress(0);
    setProcessedCount(0);
    toast({
      title: "Processing canceled",
      description: "Batch processing has been canceled.",
      duration: 3000,
    });
  };

  // Update processed images
  const handleUpdateProcessedImages = (updatedImages: ProcessedImage[]) => {
    setProcessedImages(updatedImages);
  };

  // Handle batch processing progress
  const handleBatchProgress = (progress: number, count: number) => {
    setBatchProgress(progress);
    setProcessedCount(count);
  };

  // Handle processing state change
  const handleProcessingStateChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="w-full shadow-md border-border">
        <CardHeader className="border-b border-gray-100 bg-muted/30">
          <ProcessorHeader 
            clearImageCache={handleClearCache}
            clearAnalyticsData={handleClearAnalytics}
          />
        </CardHeader>
        
        <CardContent className="p-6">
          {processedImages.length === 0 ? (
            <EmptyState onReset={onReset} />
          ) : (
            <ProcessorBody 
              images={processedImages}
              onUpdateImages={handleUpdateProcessedImages}
              onBatchProgress={handleBatchProgress}
              onProcessingStateChange={handleProcessingStateChange}
            />
          )}
        </CardContent>
      </Card>
      
      <BatchProcessingProgress 
        isProcessing={isProcessing}
        batchProgress={batchProgress}
        processedItemsCount={processedCount}
        totalItemsToProcess={processedImages.length}
        onCancel={handleCancelProcessing}
      />
    </div>
  );
};

export default MainProcessor;
