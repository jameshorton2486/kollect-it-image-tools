
import React from 'react';
import ProcessingTabs from './ProcessingTabs';
import { ProcessedImage } from '@/types/imageProcessing';
import ImageGrid from '../ImageGrid';
import EmptyState from '../EmptyState';
import BatchProcessingProgress from '../BatchProcessingProgress';

interface ProcessorBodyProps {
  processedImages: ProcessedImage[];
  compressionLevel: number;
  setCompressionLevel: (value: number) => void;
  maxWidth: number;
  setMaxWidth: (value: number) => void;
  maxHeight: number;
  setMaxHeight: (value: number) => void;
  preserveAspectRatio: boolean;
  setPreserveAspectRatio: (value: boolean) => void;
  isProcessing: boolean;
  removeBackground: boolean;
  setRemoveBackground: (value: boolean) => void;
  apiKey: string | null;
  setApiKey: (value: string) => void;
  selfHosted: boolean;
  setSelfHosted: (value: boolean) => void;
  serverUrl: string;
  setServerUrl: (value: string) => void;
  backgroundRemovalModel: string;
  setBackgroundRemovalModel: (value: string) => void;
  backgroundType: string;
  setBackgroundType: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  backgroundOpacity: number;
  setBackgroundOpacity: (value: number) => void;
  backgroundImage: File | null | undefined;
  setBackgroundImage: React.Dispatch<React.SetStateAction<File | null>> | undefined;
  kollectItApiKey: string | null | undefined;
  setKollectItApiKey: React.Dispatch<React.SetStateAction<string | null>> | undefined;
  kollectItUploadUrl: string | undefined;
  setKollectItUploadUrl: React.Dispatch<React.SetStateAction<string>> | undefined;
  showBeforeAfter: number | null;
  processImage: (index: number) => Promise<void>;
  downloadImage: (index: number) => void;
  toggleSelectImage: (index: number) => void;
  toggleBeforeAfterView: (index: number | null) => void;
  processAllImages: () => void;
  downloadAllImages: () => void;
  selectAllImages: (selected: boolean) => void;
  onReset: () => void;
  batchProgress: number;
  totalItemsToProcess: number;
  processedItemsCount: number;
  cancelBatchProcessing: () => void;
  handleAdditionalFilesUploaded: (newFiles: File[]) => void;
}

const ProcessorBody: React.FC<ProcessorBodyProps> = ({
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
  backgroundType,
  setBackgroundType,
  backgroundColor,
  setBackgroundColor,
  backgroundOpacity,
  setBackgroundOpacity,
  backgroundImage,
  setBackgroundImage,
  kollectItApiKey,
  setKollectItApiKey,
  kollectItUploadUrl,
  setKollectItUploadUrl,
  showBeforeAfter,
  processImage,
  downloadImage,
  toggleSelectImage,
  toggleBeforeAfterView,
  processAllImages,
  downloadAllImages,
  selectAllImages,
  onReset,
  batchProgress,
  totalItemsToProcess,
  processedItemsCount,
  cancelBatchProcessing,
  handleAdditionalFilesUploaded,
}) => {
  return (
    <>
      <ProcessingTabs
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
        backgroundImage={backgroundImage}
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
        onBackgroundImageChange={setBackgroundImage || (() => {})}
        onProcessAll={processAllImages}
        onDownloadAll={downloadAllImages}
        onSelectAll={selectAllImages}
        onReset={onReset}
        onAdditionalFilesUploaded={handleAdditionalFilesUploaded}
        processedImages={processedImages}
        kollectItApiKey={kollectItApiKey || null}
        kollectItUploadUrl={kollectItUploadUrl || ''}
        onKollectItApiKeyChange={setKollectItApiKey || (() => {})}
        onKollectItUploadUrlChange={setKollectItUploadUrl || (() => {})}
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
    </>
  );
};

export default ProcessorBody;
