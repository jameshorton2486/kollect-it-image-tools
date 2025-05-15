
import React from 'react';
import CompressionSettings from './ImageProcessing/CompressionSettings';
import ImageGrid from './ImageProcessing/ImageGrid';
import EmptyState from './ImageProcessing/EmptyState';
import BatchProcessingProgress from './ImageProcessing/BatchProcessingProgress';
import { useImageProcessing } from '@/hooks/useImageProcessing';

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
    cancelBatchProcessing
  } = useImageProcessing(images);
  
  return (
    <div className="space-y-6">
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
