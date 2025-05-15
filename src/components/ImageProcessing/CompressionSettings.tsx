
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw } from 'lucide-react';

interface CompressionSettingsProps {
  compressionLevel: number;
  maxWidth: number;
  maxHeight: number;
  preserveAspectRatio: boolean;
  isProcessing: boolean;
  onCompressionLevelChange: (value: number) => void;
  onMaxWidthChange: (value: number) => void;
  onMaxHeightChange: (value: number) => void;
  onPreserveAspectRatioChange: (value: boolean) => void;
  onProcessAll: () => void;
  onDownloadAll: () => void;
  onSelectAll: (selected: boolean) => void;
  onReset: () => void;
}

const CompressionSettings: React.FC<CompressionSettingsProps> = ({
  compressionLevel,
  maxWidth,
  maxHeight,
  preserveAspectRatio,
  isProcessing,
  onCompressionLevelChange,
  onMaxWidthChange,
  onMaxHeightChange,
  onPreserveAspectRatioChange,
  onProcessAll,
  onDownloadAll,
  onSelectAll,
  onReset
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Image Processing Settings</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Compression Quality: {compressionLevel}%</span>
            </div>
            <Slider
              value={[compressionLevel]} 
              min={1}
              max={100}
              step={1}
              onValueChange={(value) => onCompressionLevelChange(value[0])}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Max Width: {maxWidth}px</span>
              </div>
              <Slider
                value={[maxWidth]} 
                min={100}
                max={3000}
                step={50}
                onValueChange={(value) => onMaxWidthChange(value[0])}
                disabled={!preserveAspectRatio}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span>Max Height: {maxHeight}px</span>
              </div>
              <Slider
                value={[maxHeight]} 
                min={100}
                max={3000}
                step={50}
                onValueChange={(value) => onMaxHeightChange(value[0])}
                disabled={!preserveAspectRatio}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preserveAspect"
              checked={preserveAspectRatio}
              onCheckedChange={(checked) => onPreserveAspectRatioChange(checked as boolean)}
            />
            <label
              htmlFor="preserveAspect"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Preserve aspect ratio
            </label>
          </div>
          
          <div className="flex justify-between pt-4">
            <div className="space-x-2">
              <Button
                variant="default"
                onClick={onProcessAll}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Process All Selected'}
              </Button>
              <Button
                variant="outline"
                onClick={onDownloadAll}
              >
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
            
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectAll(true)}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectAll(false)}
              >
                Deselect All
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompressionSettings;
