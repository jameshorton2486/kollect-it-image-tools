
import React from 'react';
import { ProcessedImage, OutputFormat, CompressionSettings } from '@/types/imageProcessing';
import { ResizeMode, ResizeUnit } from '@/types/imageResizing';
import ProcessingTabs from './ProcessingTabs';
import ResizeOptionsSection from '../ResizeOptionsSection';
import ImagePreviewSection from './ImagePreviewSection';

interface ProcessorMainContentProps {
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
  processAllImages: () => void;
  downloadAllImages: () => void;
  selectAllImages: (selected: boolean) => void;
  onReset: () => void;
  handleAdditionalFilesUploaded: (newFiles: File[]) => void;
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
  resizeMode: ResizeMode;
  setResizeMode: (mode: ResizeMode) => void;
  resizeUnit: ResizeUnit;
  setResizeUnit: (unit: ResizeUnit) => void;
  resizeQuality: number;
  setResizeQuality: (quality: number) => void;
  applyResizePreset: (presetKey: string) => void;
}

const ProcessorMainContent: React.FC<ProcessorMainContentProps> = (props) => {
  return (
    <div className="col-span-2">
      {/* Image Preview Section with Before/After slider */}
      <ImagePreviewSection 
        processedImages={props.processedImages}
        maxWidth={props.maxWidth}
        maxHeight={props.maxHeight}
        setMaxWidth={props.setMaxWidth}
        setMaxHeight={props.setMaxHeight}
      />

      <ProcessingTabs
        compressionLevel={props.compressionLevel}
        maxWidth={props.maxWidth}
        maxHeight={props.maxHeight}
        preserveAspectRatio={props.preserveAspectRatio}
        isProcessing={props.isProcessing}
        removeBackground={props.removeBackground}
        apiKey={props.apiKey}
        selfHosted={props.selfHosted}
        serverUrl={props.serverUrl}
        backgroundRemovalModel={props.backgroundRemovalModel}
        backgroundType={props.backgroundType}
        backgroundColor={props.backgroundColor}
        backgroundOpacity={props.backgroundOpacity}
        backgroundImage={props.backgroundImage}
        onCompressionLevelChange={props.setCompressionLevel}
        onMaxWidthChange={props.setMaxWidth}
        onMaxHeightChange={props.setMaxHeight}
        onPreserveAspectRatioChange={props.setPreserveAspectRatio}
        onRemoveBackgroundChange={props.setRemoveBackground}
        onApiKeyChange={props.setApiKey}
        onSelfHostedChange={props.setSelfHosted}
        onServerUrlChange={props.setServerUrl}
        onBackgroundRemovalModelChange={props.setBackgroundRemovalModel}
        onBackgroundTypeChange={props.setBackgroundType}
        onBackgroundColorChange={props.setBackgroundColor}
        onBackgroundOpacityChange={props.setBackgroundOpacity}
        onBackgroundImageChange={props.setBackgroundImage || (() => {})}
        onProcessAll={props.processAllImages}
        onDownloadAll={props.downloadAllImages}
        onSelectAll={props.selectAllImages}
        onReset={props.onReset}
        onAdditionalFilesUploaded={props.handleAdditionalFilesUploaded}
        processedImages={props.processedImages}
        kollectItApiKey={props.kollectItApiKey || null}
        kollectItUploadUrl={props.kollectItUploadUrl || ''}
        onKollectItApiKeyChange={props.setKollectItApiKey || (() => {})}
        onKollectItUploadUrlChange={props.setKollectItUploadUrl || (() => {})}
        outputFormat={props.outputFormat}
        onOutputFormatChange={props.setOutputFormat}
        compressionSettings={props.compressionSettings}
        onCompressionSettingsChange={props.setCompressionSettings}
        stripMetadata={props.stripMetadata}
        onStripMetadataChange={props.setStripMetadata}
        progressiveLoading={props.progressiveLoading}
        onProgressiveLoadingChange={props.setProgressiveLoading}
        estimatedSizes={props.estimatedSizes}
      />

      {/* Resize Options Section */}
      <div className="mt-6">
        <ResizeOptionsSection
          width={props.maxWidth}
          height={props.maxHeight}
          preserveAspectRatio={props.preserveAspectRatio}
          quality={props.resizeQuality}
          resizeMode={props.resizeMode}
          resizeUnit={props.resizeUnit}
          onWidthChange={props.setMaxWidth}
          onHeightChange={props.setMaxHeight}
          onPreserveAspectRatioChange={props.setPreserveAspectRatio}
          onQualityChange={props.setResizeQuality}
          onResizeModeChange={props.setResizeMode}
          onResizeUnitChange={props.setResizeUnit}
          onApplyWordPressPreset={props.applyResizePreset}
          estimatedFileSize={props.estimatedSizes.jpeg}
          selectedImage={props.processedImages[0] || null}
        />
      </div>
    </div>
  );
};

export default ProcessorMainContent;
