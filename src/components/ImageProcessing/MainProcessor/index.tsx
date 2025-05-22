import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ProcessorHeader from './ProcessorHeader';
import ProcessorBody from './ProcessorBody';
import { ProcessedImage } from '@/types/imageProcessing';
import { useWordPressImageActions } from '@/hooks/useWordPressImageActions';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const MainProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
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
    // Background options
    backgroundType,
    setBackgroundType,
    backgroundColor,
    setBackgroundColor,
    backgroundOpacity,
    setBackgroundOpacity,
    backgroundImage,
    setBackgroundImage,
    // Kollect-It integration
    kollectItApiKey,
    setKollectItApiKey,
    kollectItUploadUrl,
    setKollectItUploadUrl,
    // Export path for saving files
    exportPath,
    setExportPath,
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
  
  // WordPress specific actions
  const {
    applyWordPressType,
    applyBulkWordPressType,
    renameImage,
    setOutputFormat,
    removeImage
  } = useWordPressImageActions({
    processedImages,
    setProcessedImages,
    exportPath,
    setExportPath,
    maxWidth,
    maxHeight,
    setMaxWidth,
    setMaxHeight
  });
  
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
          <ProcessorHeader 
            clearImageCache={clearImageCache}
            clearAnalyticsData={clearAnalyticsData}
          />
        </CardHeader>
        
        <CardContent>
          <ProcessorBody 
            processedImages={processedImages}
            compressionLevel={compressionLevel}
            setCompressionLevel={setCompressionLevel}
            maxWidth={maxWidth}
            setMaxWidth={setMaxWidth}
            maxHeight={maxHeight}
            setMaxHeight={setMaxHeight}
            preserveAspectRatio={preserveAspectRatio}
            setPreserveAspectRatio={setPreserveAspectRatio}
            isProcessing={isProcessing}
            removeBackground={removeBackground}
            setRemoveBackground={setRemoveBackground}
            apiKey={apiKey}
            setApiKey={setApiKey}
            selfHosted={selfHosted}
            setSelfHosted={setSelfHosted}
            serverUrl={serverUrl}
            setServerUrl={setServerUrl}
            backgroundRemovalModel={backgroundRemovalModel}
            setBackgroundRemovalModel={setBackgroundRemovalModel}
            backgroundType={backgroundType}
            setBackgroundType={setBackgroundType}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            backgroundOpacity={backgroundOpacity}
            setBackgroundOpacity={setBackgroundOpacity}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
            kollectItApiKey={kollectItApiKey}
            setKollectItApiKey={setKollectItApiKey}
            kollectItUploadUrl={kollectItUploadUrl}
            setKollectItUploadUrl={setKollectItUploadUrl}
            showBeforeAfter={showBeforeAfter}
            processImage={processImage}
            downloadImage={downloadImage}
            toggleSelectImage={toggleSelectImage}
            toggleBeforeAfterView={toggleBeforeAfterView}
            processAllImages={processAllImages}
            downloadAllImages={downloadAllImages}
            selectAllImages={selectAllImages}
            onReset={onReset}
            batchProgress={batchProgress}
            totalItemsToProcess={totalItemsToProcess}
            processedItemsCount={processedItemsCount}
            cancelBatchProcessing={cancelBatchProcessing}
            handleAdditionalFilesUploaded={handleAdditionalFilesUploaded}
            // WordPress and file management features
            applyWordPressType={applyWordPressType}
            applyBulkWordPressType={applyBulkWordPressType}
            renameImage={renameImage}
            setOutputFormat={setOutputFormat}
            exportPath={exportPath}
            setExportPath={setExportPath}
            removeImage={removeImage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Import the hook at the top of the file
import { useImageProcessing } from '@/hooks/useImageProcessing';

export default MainProcessor;
