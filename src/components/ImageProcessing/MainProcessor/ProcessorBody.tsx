import React, { useState, useEffect } from 'react';
import ProcessingTabs from './ProcessingTabs';
import { ProcessedImage, WordPressPreset, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import ImageGrid from '../ImageGrid';
import EmptyState from '../EmptyState';
import BatchProcessingProgress from '../BatchProcessingProgress';
import WordPressImageOptions from '../WordPressImageOptions';
import WordPressPresetsSection from '../WordPressPresetsSection';
import EcommercePresetsSection from '../EcommercePresetsSection';
import FormatOptionsSection from '../FormatOptionsSection';
import HtmlCodePreviewDialog from '../HtmlCodePreviewDialog';
import ResizeOptionsSection from '../ResizeOptionsSection';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';
import ResizePreviewSection from '../ResizePreviewSection';

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
  // WordPress and file management props
  applyWordPressType: (imageIndex: number, typeId: string) => void;
  applyBulkWordPressType: (typeId: string) => void;
  renameImage: (imageIndex: number, newName: string) => void;
  setImageOutputFormat: (imageIndex: number, format: string) => void;
  exportPath: string;
  setExportPath: (path: string) => void;
  removeImage: (index: number) => void;
  // New multi-format compression props
  outputFormat: OutputFormat;
  setOutputFormat: (format: OutputFormat) => void;
  compressionSettings: CompressionSettings;
  setCompressionSettings: (settings: CompressionSettings) => void;
  stripMetadata: boolean;
  setStripMetadata: (strip: boolean) => void;
  progressiveLoading: boolean;
  setProgressiveLoading: (progressive: boolean) => void;
  estimatedSizes: {
    original: number;
    jpeg: number | null;
    webp: number | null;
    avif: number | null;
  };
  applyWordPressPreset: (preset: WordPressPreset) => void;
  downloadImageFormat: (imageIndex: number, format: string) => void;
  downloadAllFormats: (imageIndex: number) => void;
  viewHtmlCode: (imageIndex: number) => void;
  // Resize options
  resizeMode: ResizeMode;
  setResizeMode: (mode: ResizeMode) => void;
  resizeUnit: ResizeUnit;
  setResizeUnit: (unit: ResizeUnit) => void;
  resizeQuality: number;
  setResizeQuality: (quality: number) => void;
  applyResizePreset: (presetKey: string) => void;
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
  applyWordPressType,
  applyBulkWordPressType,
  renameImage,
  setImageOutputFormat,
  exportPath,
  setExportPath,
  removeImage,
  // New multi-format compression props
  outputFormat,
  setOutputFormat,
  compressionSettings,
  setCompressionSettings,
  stripMetadata,
  setStripMetadata,
  progressiveLoading,
  setProgressiveLoading,
  estimatedSizes,
  applyWordPressPreset,
  downloadImageFormat,
  downloadAllFormats,
  viewHtmlCode,
  // Resize options
  resizeMode,
  setResizeMode,
  resizeUnit,
  setResizeUnit,
  resizeQuality,
  setResizeQuality,
  applyResizePreset
}) => {
  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false);
  const [selectedImageForHtml, setSelectedImageForHtml] = useState<ProcessedImage | null>(null);
  const [selectedImageForPreview, setSelectedImageForPreview] = useState<ProcessedImage | null>(null);
  const [originalImageWidth, setOriginalImageWidth] = useState<number>(0);
  const [originalImageHeight, setOriginalImageHeight] = useState<number>(0);

  const handleViewHtmlCode = (imageIndex: number) => {
    setSelectedImageForHtml(processedImages[imageIndex]);
    setHtmlPreviewOpen(true);
  };

  // Handler for image selection
  const handleImageSelect = (image: ProcessedImage) => {
    setSelectedImageForPreview(image);
    
    // Get original dimensions from image if available
    if (image.dimensions) {
      setOriginalImageWidth(image.dimensions.width);
      setOriginalImageHeight(image.dimensions.height);
    } else {
      // If dimensions aren't available, load them from the original image
      const img = new Image();
      img.onload = () => {
        setOriginalImageWidth(img.width);
        setOriginalImageHeight(img.height);
      };
      img.src = image.preview;
    }
  };

  // Reset dimensions to original
  const handleResetDimensions = () => {
    if (originalImageWidth && originalImageHeight) {
      setMaxWidth(originalImageWidth);
      setMaxHeight(originalImageHeight);
    }
  };

  // Select the first image for preview by default, if available
  useEffect(() => {
    if (processedImages.length > 0 && !selectedImageForPreview) {
      handleImageSelect(processedImages[0]);
    }
  }, [processedImages, selectedImageForPreview]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          {/* Image Preview Section with Before/After slider */}
          {selectedImageForPreview && (
            <ResizePreviewSection 
              selectedImage={selectedImageForPreview}
              originalWidth={originalImageWidth}
              originalHeight={originalImageHeight}
              resizedWidth={maxWidth}
              resizedHeight={maxHeight}
              onWidthChange={setMaxWidth}
              onHeightChange={setMaxHeight}
              onResetDimensions={handleResetDimensions}
            />
          )}

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
            // New props
            outputFormat={outputFormat}
            onOutputFormatChange={setOutputFormat}
            compressionSettings={compressionSettings}
            onCompressionSettingsChange={setCompressionSettings}
            stripMetadata={stripMetadata}
            onStripMetadataChange={setStripMetadata}
            progressiveLoading={progressiveLoading}
            onProgressiveLoadingChange={setProgressiveLoading}
            estimatedSizes={estimatedSizes}
          />

          {/* Add the enhanced ResizeOptionsSection with image preview */}
          <div className="mt-6">
            <ResizeOptionsSection
              width={maxWidth}
              height={maxHeight}
              preserveAspectRatio={preserveAspectRatio}
              quality={resizeQuality}
              resizeMode={resizeMode}
              resizeUnit={resizeUnit}
              onWidthChange={setMaxWidth}
              onHeightChange={setMaxHeight}
              onPreserveAspectRatioChange={setPreserveAspectRatio}
              onQualityChange={setResizeQuality}
              onResizeModeChange={setResizeMode}
              onResizeUnitChange={setResizeUnit}
              onApplyWordPressPreset={applyResizePreset}
              estimatedFileSize={estimatedSizes.jpeg}
              selectedImage={selectedImageForPreview}
            />
          </div>
        </div>
        
        <div className="col-span-1 space-y-4">
          <WordPressImageOptions
            processedImages={processedImages}
            onApplyWordPressType={applyWordPressType}
            onApplyBulkWordPressType={applyBulkWordPressType}
            onRenameImage={renameImage}
            onSetOutputFormat={setImageOutputFormat}
            onSetExportPath={setExportPath}
            exportPath={exportPath}
          />
          
          <WordPressPresetsSection
            onApplyPreset={applyWordPressPreset}
          />
          
          <EcommercePresetsSection
            onApplyPreset={(width, height) => {
              setMaxWidth(width);
              setMaxHeight(height);
            }}
          />
        </div>
      </div>
      
      <FormatOptionsSection
        outputFormat={outputFormat}
        onOutputFormatChange={setOutputFormat}
        compressionSettings={compressionSettings}
        onCompressionSettingsChange={setCompressionSettings}
        stripMetadata={stripMetadata}
        onStripMetadataChange={setStripMetadata}
        progressiveLoading={progressiveLoading}
        onProgressiveLoadingChange={setProgressiveLoading}
        isProcessing={isProcessing}
        estimatedSizes={estimatedSizes}
      />
      
      {processedImages.length > 0 ? (
        <ImageGrid
          images={processedImages}
          showBeforeAfterIndex={showBeforeAfter}
          onProcessImage={processImage}
          onDownloadImage={downloadImage}
          onToggleSelectImage={toggleSelectImage}
          onToggleBeforeAfterView={toggleBeforeAfterView}
          onRenameImage={renameImage}
          onSetOutputFormat={setImageOutputFormat} 
          onSetWordPressType={applyWordPressType}
          onRemoveImage={removeImage}
          onDownloadFormat={downloadImageFormat}
          onViewHtmlCode={handleViewHtmlCode}
          onDownloadAllFormats={downloadAllFormats}
          onImageSelect={handleImageSelect}
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
      
      {/* HTML Code Preview Dialog */}
      <HtmlCodePreviewDialog
        open={htmlPreviewOpen}
        onOpenChange={setHtmlPreviewOpen}
        image={selectedImageForHtml}
      />
    </>
  );
};

export default ProcessorBody;
