
import React from 'react';
import CompressionSettings from './ImageProcessing/CompressionSettings';
import ImageGrid from './ImageProcessing/ImageGrid';
import EmptyState from './ImageProcessing/EmptyState';
import BatchProcessingProgress from './ImageProcessing/BatchProcessingProgress';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { Button } from './ui/button';
import { Database, RefreshCw, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Link } from 'react-router-dom';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
  const {
    processedImages,
    compressionLevel,
    setCompressionLevel,
    maxWidth,
    setMaxWidth,
    maxHeight,
    setMaxHeight,
    preserveAspectRatio,
    setPreserveAspectRatio,
    isProcessing,
    processImage,
    processAllImages,
    downloadImage,
    downloadAllImages,
    toggleSelectImage,
    selectAllImages,
    // Background removal features
    removeBackground,
    setRemoveBackground,
    apiKey,
    setApiKey,
    selfHosted,
    setSelfHosted,
    serverUrl,
    setServerUrl,
    showBeforeAfter,
    toggleBeforeAfterView,
    // Batch processing progress
    batchProgress,
    totalItemsToProcess,
    processedItemsCount,
    cancelBatchProcessing,
    // Cache and analytics management
    clearImageCache,
    clearAnalyticsData
  } = useImageProcessing(images);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Image Processor</h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearImageCache}
                  className="gap-1"
                >
                  <Database className="h-4 w-4" />
                  <RefreshCw className="h-3 w-3" />
                  Clear Cache
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear image processing cache to free up browser storage</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Link to="/analytics">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View processing statistics and usage analytics</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
        </div>
      </div>
      
      <CompressionSettings
        compressionLevel={compressionLevel}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        preserveAspectRatio={preserveAspectRatio}
        isProcessing={isProcessing}
        removeBackground={removeBackground}
        apiKey={apiKey}
        selfHosted={selfHosted}
        serverUrl={serverUrl}
        onCompressionLevelChange={setCompressionLevel}
        onMaxWidthChange={setMaxWidth}
        onMaxHeightChange={setMaxHeight}
        onPreserveAspectRatioChange={setPreserveAspectRatio}
        onRemoveBackgroundChange={setRemoveBackground}
        onApiKeyChange={setApiKey}
        onSelfHostedChange={setSelfHosted}
        onServerUrlChange={setServerUrl}
        onProcessAll={processAllImages}
        onDownloadAll={downloadAllImages}
        onSelectAll={selectAllImages}
        onReset={onReset}
      />
      
      {processedImages.length > 0 ? (
        <ImageGrid
          images={processedImages}
          showBeforeAfterIndex={showBeforeAfter}
          onProcessImage={processImage}
          onDownloadImage={downloadImage}
          onToggleSelectImage={toggleSelectImage}
          onToggleBeforeAfterView={toggleBeforeAfterView}
        />
      ) : (
        <EmptyState onReset={onReset} />
      )}
      
      {/* Batch processing progress indicator */}
      <BatchProcessingProgress
        isProcessing={isProcessing}
        batchProgress={batchProgress}
        processedItemsCount={processedItemsCount}
        totalItemsToProcess={totalItemsToProcess}
        onCancel={cancelBatchProcessing}
      />
    </div>
  );
};

export default ImageProcessor;
