
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from 'lucide-react';
import CompressionQualitySection from './CompressionQualitySection';
import DimensionsSection from './DimensionsSection';
import BackgroundRemovalSection from './BackgroundRemovalSection';
import BackgroundOptionsSection from './BackgroundOptionsSection';
import ActionButtons from './ActionButtons';
import { Separator } from '@/components/ui/separator';

interface CompressionSettingsProps {
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
  backgroundImage: File | null;
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
  onBackgroundImageChange: (file: File | null) => void;
  onProcessAll: () => void;
  onDownloadAll: () => void;
  onSelectAll: (selected: boolean) => void;
  onReset: () => void;
}

const CompressionSettings: React.FC<CompressionSettingsProps> = (props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Image Processing Settings</span>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onReset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Compression Quality Slider */}
          <CompressionQualitySection 
            compressionLevel={props.compressionLevel}
            onCompressionLevelChange={props.onCompressionLevelChange}
          />
          
          {/* Image Dimensions */}
          <DimensionsSection 
            maxWidth={props.maxWidth}
            maxHeight={props.maxHeight}
            preserveAspectRatio={props.preserveAspectRatio}
            onMaxWidthChange={props.onMaxWidthChange}
            onMaxHeightChange={props.onMaxHeightChange}
            onPreserveAspectRatioChange={props.onPreserveAspectRatioChange}
          />
          
          <Separator />
          
          {/* Background Removal Section */}
          <BackgroundRemovalSection 
            removeBackground={props.removeBackground}
            apiKey={props.apiKey}
            selfHosted={props.selfHosted}
            serverUrl={props.serverUrl}
            backgroundRemovalModel={props.backgroundRemovalModel}
            onRemoveBackgroundChange={props.onRemoveBackgroundChange}
            onApiKeyChange={props.onApiKeyChange}
            onSelfHostedChange={props.onSelfHostedChange}
            onServerUrlChange={props.onServerUrlChange}
            onBackgroundRemovalModelChange={props.onBackgroundRemovalModelChange}
          />
          
          {/* Show background options only if background removal is enabled */}
          {props.removeBackground && (
            <BackgroundOptionsSection 
              backgroundType={props.backgroundType}
              backgroundColor={props.backgroundColor}
              backgroundOpacity={props.backgroundOpacity}
              onBackgroundTypeChange={props.onBackgroundTypeChange}
              onBackgroundColorChange={props.onBackgroundColorChange}
              onBackgroundOpacityChange={props.onBackgroundOpacityChange}
            />
          )}

          <Separator />
          
          {/* Action Buttons */}
          <ActionButtons
            isProcessing={props.isProcessing}
            onProcessAll={props.onProcessAll}
            onDownloadAll={props.onDownloadAll}
            onSelectAll={props.onSelectAll}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompressionSettings;
