
import React, { useState } from 'react';
import { ProcessedImage, WordPressPreset, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';
import ImageGrid from '../ImageGrid';
import EmptyState from '../EmptyState';
import BatchProcessingProgress from '../BatchProcessingProgress';
import FormatOptionsSection from '../FormatOptionsSection';
import HtmlCodePreviewDialog from '../HtmlCodePreviewDialog';
import ProcessorMainContent from './ProcessorMainContent';
import ProcessorSidebar from './ProcessorSidebar';

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
  applyWordPressType: (imageIndex: number, typeId: string) => void;
  applyBulkWordPressType: (typeId: string) => void;
  renameImage: (imageIndex: number, newName: string) => void;
  setImageOutputFormat: (imageIndex: number, format: string) => void;
  exportPath: string;
  setExportPath: (path: string) => void;
  removeImage: (index: number) => void;
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
  resizeMode: ResizeMode;
  setResizeMode: (mode: ResizeMode) => void;
  resizeUnit: ResizeUnit;
  setResizeUnit: (unit: ResizeUnit) => void;
  resizeQuality: number;
  setResizeQuality: (quality: number) => void;
  applyResizePreset: (presetKey: string) => void;
}

const ProcessorBody: React.FC<ProcessorBodyProps> = (props) => {
  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false);
  const [selectedImageForHtml, setSelectedImageForHtml] = useState<ProcessedImage | null>(null);

  const handleViewHtmlCode = (imageIndex: number) => {
    setSelectedImageForHtml(props.processedImages[imageIndex]);
    setHtmlPreviewOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ProcessorMainContent {...props} />
        <ProcessorSidebar 
          processedImages={props.processedImages}
          applyWordPressType={props.applyWordPressType}
          applyBulkWordPressType={props.applyBulkWordPressType}
          renameImage={props.renameImage}
          setImageOutputFormat={props.setImageOutputFormat}
          exportPath={props.exportPath}
          setExportPath={props.setExportPath}
          applyWordPressPreset={props.applyWordPressPreset}
          setMaxWidth={props.setMaxWidth}
          setMaxHeight={props.setMaxHeight}
        />
      </div>
      
      <FormatOptionsSection
        outputFormat={props.outputFormat}
        onOutputFormatChange={props.setOutputFormat}
        compressionSettings={props.compressionSettings}
        onCompressionSettingsChange={props.setCompressionSettings}
        stripMetadata={props.stripMetadata}
        onStripMetadataChange={props.setStripMetadata}
        progressiveLoading={props.progressiveLoading}
        onProgressiveLoadingChange={props.setProgressiveLoading}
        isProcessing={props.isProcessing}
        estimatedSizes={props.estimatedSizes}
      />
      
      {props.processedImages.length > 0 ? (
        <ImageGrid
          images={props.processedImages}
          showBeforeAfterIndex={props.showBeforeAfter}
          onProcessImage={props.processImage}
          onDownloadImage={props.downloadImage}
          onToggleSelectImage={props.toggleSelectImage}
          onToggleBeforeAfterView={props.toggleBeforeAfterView}
          onRenameImage={props.renameImage}
          onSetOutputFormat={props.setImageOutputFormat} 
          onSetWordPressType={props.applyWordPressType}
          onRemoveImage={props.removeImage}
          onDownloadFormat={props.downloadImageFormat}
          onViewHtmlCode={handleViewHtmlCode}
          onDownloadAllFormats={props.downloadAllFormats}
          onImageSelect={() => {}}
        />
      ) : (
        <EmptyState onReset={props.onReset} />
      )}
      
      <BatchProcessingProgress
        isProcessing={props.isProcessing}
        batchProgress={props.batchProgress}
        processedItemsCount={props.processedItemsCount}
        totalItemsToProcess={props.totalItemsToProcess}
        onCancel={props.cancelBatchProcessing}
      />
      
      <HtmlCodePreviewDialog
        open={htmlPreviewOpen}
        onOpenChange={setHtmlPreviewOpen}
        image={selectedImageForHtml}
      />
    </>
  );
};

export default ProcessorBody;
