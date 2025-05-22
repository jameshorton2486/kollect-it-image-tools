
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompressionSettings from '../CompressionSettings';
import BatchUploadSection from '../BatchUploadSection';
import KollectItIntegrationSection from '../KollectItIntegrationSection';
import { ProcessedImage, OutputFormat, CompressionSettings as CompressionSettingsType } from '@/types/imageProcessing';

interface ProcessingTabsProps {
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  preserveAspectRatio: boolean;
  isProcessing: boolean;
  removeBackground: boolean;
  apiKey: string | null;
  selfHosted: boolean;
  serverUrl: string;
  backgroundRemovalModel: string;
  backgroundType: string;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage: File | null | undefined;
  onCompressionLevelChange: (value: number) => void;
  onMaxWidthChange: (value: number) => void;
  onMaxHeightChange: (value: number) => void;
  onPreserveAspectRatioChange: (value: boolean) => void;
  onRemoveBackgroundChange: (value: boolean) => void;
  onApiKeyChange: (value: string) => void;
  onSelfHostedChange: (value: boolean) => void;
  onServerUrlChange: (value: string) => void;
  onBackgroundRemovalModelChange: (value: string) => void;
  onBackgroundTypeChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onBackgroundOpacityChange: (value: number) => void;
  onBackgroundImageChange: (value: File | null) => void;
  onProcessAll: () => void;
  onDownloadAll: () => void;
  onSelectAll: (selected: boolean) => void;
  onReset: () => void;
  onAdditionalFilesUploaded: (files: File[]) => void;
  processedImages: ProcessedImage[];
  kollectItApiKey: string | null;
  kollectItUploadUrl: string;
  onKollectItApiKeyChange: (value: string) => void;
  onKollectItUploadUrlChange: (value: string) => void;
  // New multi-format props
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
  compressionSettings: CompressionSettingsType;
  onCompressionSettingsChange: (settings: CompressionSettingsType) => void;
  stripMetadata: boolean;
  onStripMetadataChange: (strip: boolean) => void;
  progressiveLoading: boolean;
  onProgressiveLoadingChange: (progressive: boolean) => void;
  estimatedSizes: {
    original: number;
    jpeg: number | null;
    webp: number | null;
    avif: number | null;
  };
}

const ProcessingTabs: React.FC<ProcessingTabsProps> = ({
  compressionLevel,
  maxWidth,
  maxHeight,
  preserveAspectRatio,
  isProcessing,
  removeBackground,
  apiKey,
  selfHosted,
  serverUrl,
  backgroundRemovalModel,
  backgroundType,
  backgroundColor,
  backgroundOpacity,
  backgroundImage,
  onCompressionLevelChange,
  onMaxWidthChange,
  onMaxHeightChange,
  onPreserveAspectRatioChange,
  onRemoveBackgroundChange,
  onApiKeyChange,
  onSelfHostedChange,
  onServerUrlChange,
  onBackgroundRemovalModelChange,
  onBackgroundTypeChange,
  onBackgroundColorChange,
  onBackgroundOpacityChange,
  onBackgroundImageChange,
  onProcessAll,
  onDownloadAll,
  onSelectAll,
  onReset,
  onAdditionalFilesUploaded,
  processedImages,
  kollectItApiKey,
  kollectItUploadUrl,
  onKollectItApiKeyChange,
  onKollectItUploadUrlChange,
  // New multi-format props
  outputFormat,
  onOutputFormatChange,
  compressionSettings,
  onCompressionSettingsChange,
  stripMetadata,
  onStripMetadataChange,
  progressiveLoading,
  onProgressiveLoadingChange,
  estimatedSizes,
}) => {
  return (
    <Tabs defaultValue="settings" className="space-y-4">
      <TabsList className="grid grid-cols-3 w-full max-w-md mb-2">
        <TabsTrigger value="settings">Processing Settings</TabsTrigger>
        <TabsTrigger value="batch">Batch Upload</TabsTrigger>
        <TabsTrigger value="integration">Kollect-It</TabsTrigger>
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
          backgroundImage={backgroundImage}
          onCompressionLevelChange={onCompressionLevelChange}
          onMaxWidthChange={onMaxWidthChange}
          onMaxHeightChange={onMaxHeightChange}
          onPreserveAspectRatioChange={onPreserveAspectRatioChange}
          onRemoveBackgroundChange={onRemoveBackgroundChange}
          onApiKeyChange={onApiKeyChange}
          onSelfHostedChange={onSelfHostedChange}
          onServerUrlChange={onServerUrlChange}
          onBackgroundRemovalModelChange={onBackgroundRemovalModelChange}
          onBackgroundTypeChange={onBackgroundTypeChange}
          onBackgroundColorChange={onBackgroundColorChange}
          onBackgroundOpacityChange={onBackgroundOpacityChange}
          onBackgroundImageChange={onBackgroundImageChange}
          onProcessAll={onProcessAll}
          onDownloadAll={onDownloadAll}
          onSelectAll={onSelectAll}
          onReset={onReset}
          // New multi-format props
          outputFormat={outputFormat}
          onOutputFormatChange={onOutputFormatChange}
          compressionSettings={compressionSettings}
          onCompressionSettingsChange={onCompressionSettingsChange}
          stripMetadata={stripMetadata}
          onStripMetadataChange={onStripMetadataChange}
          progressiveLoading={progressiveLoading}
          onProgressiveLoadingChange={onProgressiveLoadingChange}
          estimatedSizes={estimatedSizes}
        />
      </TabsContent>
      
      <TabsContent value="batch" className="space-y-4">
        <BatchUploadSection 
          onFilesUploaded={onAdditionalFilesUploaded} 
          isProcessing={isProcessing} 
        />
      </TabsContent>
      
      <TabsContent value="integration" className="space-y-4">
        <KollectItIntegrationSection 
          processedImages={processedImages}
          apiKey={kollectItApiKey || ''}
          uploadUrl={kollectItUploadUrl || 'https://api.kollect-it.com/upload'}
          onApiKeyChange={onKollectItApiKeyChange || (() => {})}
          onUploadUrlChange={onKollectItUploadUrlChange || (() => {})}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProcessingTabs;
