
import React from 'react';
import CompressionSettings from './ImageProcessing/CompressionSettings';
import ImageGrid from './ImageProcessing/ImageGrid';
import EmptyState from './ImageProcessing/EmptyState';
import BatchProcessingProgress from './ImageProcessing/BatchProcessingProgress';
import BatchUploadSection from './ImageProcessing/BatchUploadSection';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { ProcessedImage } from '@/types/imageProcessing';
import { Button } from './ui/button';
import { Database, RefreshCw, BarChart3, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
  const {
    processedImages,
    setProcessedImages,
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
    backgroundRemovalModel,
    setBackgroundRemovalModel,
    // New background options
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    backgroundOpacity,
    setBackgroundOpacity,
    // Other features
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
  
  // Handler for batch upload
  const handleAdditionalFilesUploaded = (newFiles: File[]) => {
    // Create new processed image entries for the newly added files
    const newProcessedImages = newFiles.map(file => ({
      original: file,
      processed: null,
      preview: URL.createObjectURL(file),
      isProcessing: false,
      isSelected: true,
      hasBackgroundRemoved: false,
    }));
    
    // Add to the existing list
    setProcessedImages([...processedImages, ...newProcessedImages]);
  };
  
  return (
    <div className="space-y-6">
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Image Processor</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Optimize and process images for your WordPress site
              </CardDescription>
            </div>
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
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => window.open('https://docs.kollect-it.com/image-processor', '_blank')}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View user guide and documentation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="settings" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-2">
              <TabsTrigger value="settings">Processing Settings</TabsTrigger>
              <TabsTrigger value="batch">Batch Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4">
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
                backgroundRemovalModel={backgroundRemovalModel}
                backgroundType={backgroundType}
                backgroundColor={backgroundColor}
                backgroundOpacity={backgroundOpacity}
                onCompressionLevelChange={setCompressionLevel}
                onMaxWidthChange={setMaxWidth}
                onMaxHeightChange={setMaxHeight}
                onPreserveAspectRatioChange={setPreserveAspectRatio}
                onRemoveBackgroundChange={setRemoveBackground}
                onApiKeyChange={setApiKey}
                onSelfHostedChange={setSelfHosted}
                onServerUrlChange={setServerUrl}
                onBackgroundRemovalModelChange={setBackgroundRemovalModel}
                onBackgroundTypeChange={setBackgroundType}
                onBackgroundColorChange={setBackgroundColor}
                onBackgroundOpacityChange={setBackgroundOpacity}
                onProcessAll={processAllImages}
                onDownloadAll={downloadAllImages}
                onSelectAll={selectAllImages}
                onReset={onReset}
              />
            </TabsContent>
            
            <TabsContent value="batch" className="space-y-4">
              <BatchUploadSection 
                onFilesUploaded={handleAdditionalFilesUploaded} 
                isProcessing={isProcessing} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
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
