
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw, Image } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";

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
  onCompressionLevelChange: (value: number) => void;
  onMaxWidthChange: (value: number) => void;
  onMaxHeightChange: (value: number) => void;
  onPreserveAspectRatioChange: (value: boolean) => void;
  onRemoveBackgroundChange: (value: boolean) => void;
  onApiKeyChange: (value: string) => void;
  onSelfHostedChange: (value: boolean) => void;
  onServerUrlChange: (value: string) => void;
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
  removeBackground,
  apiKey,
  selfHosted,
  serverUrl,
  onCompressionLevelChange,
  onMaxWidthChange,
  onMaxHeightChange,
  onPreserveAspectRatioChange,
  onRemoveBackgroundChange,
  onApiKeyChange,
  onSelfHostedChange,
  onServerUrlChange,
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
          
          {/* Background Removal Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-3">Background Removal</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="remove-bg"
                  checked={removeBackground}
                  onCheckedChange={onRemoveBackgroundChange}
                />
                <label
                  htmlFor="remove-bg"
                  className="text-sm font-medium leading-none"
                >
                  Remove background from images
                </label>
              </div>
            </div>
            
            {removeBackground && (
              <div className="space-y-4 pl-2 border-l-2 border-muted p-4 rounded bg-muted/20">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="self-hosted"
                    checked={selfHosted}
                    onCheckedChange={(checked) => onSelfHostedChange(checked as boolean)}
                  />
                  <label
                    htmlFor="self-hosted"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Use self-hosted Rembg service
                  </label>
                </div>
                
                {selfHosted ? (
                  <FormItem>
                    <FormLabel>Rembg Server URL</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="http://localhost:5000/remove-bg"
                        value={serverUrl || ''}
                        onChange={(e) => onServerUrlChange(e.target.value)}
                        className="font-mono"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the URL of your self-hosted Rembg server
                    </p>
                  </FormItem>
                ) : (
                  <FormItem>
                    <FormLabel>Remove.bg API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your Remove.bg API key"
                        value={apiKey || ''}
                        onChange={(e) => onApiKeyChange(e.target.value)}
                        className="font-mono"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get your API key from <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer" className="underline">remove.bg/api</a>
                    </p>
                  </FormItem>
                )}
              </div>
            )}
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
