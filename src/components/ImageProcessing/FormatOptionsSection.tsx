
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { OutputFormat, CompressionSettings } from '@/types/imageProcessing';

interface FormatOptionsSectionProps {
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
  compressionSettings: CompressionSettings;
  onCompressionSettingsChange: (settings: CompressionSettings) => void;
  stripMetadata: boolean;
  onStripMetadataChange: (strip: boolean) => void;
  progressiveLoading: boolean;
  onProgressiveLoadingChange: (progressive: boolean) => void;
  isProcessing: boolean;
  estimatedSizes: {
    original: number;
    jpeg: number | null;
    webp: number | null;
    avif: number | null;
  };
}

const FormatOptionsSection: React.FC<FormatOptionsSectionProps> = ({
  outputFormat,
  onOutputFormatChange,
  compressionSettings,
  onCompressionSettingsChange,
  stripMetadata,
  onStripMetadataChange,
  progressiveLoading,
  onProgressiveLoadingChange,
  isProcessing,
  estimatedSizes
}) => {
  const handleQualityChange = (format: 'jpeg' | 'webp' | 'avif', value: number[]) => {
    onCompressionSettingsChange({
      ...compressionSettings,
      [format]: {
        ...compressionSettings[format],
        quality: value[0]
      }
    });
  };

  const handleLosslessChange = (format: 'webp' | 'avif', value: boolean) => {
    onCompressionSettingsChange({
      ...compressionSettings,
      [format]: {
        ...compressionSettings[format],
        lossless: value
      }
    });
  };

  const formatBrowserSupport = {
    jpeg: '100%',
    webp: '96.45%',
    avif: '79.15%'
  };

  // Define format descriptions as a record with proper type
  const formatDescription: Record<OutputFormat, string> = {
    'auto': 'Automatically selects the best format based on file size and browser support',
    'avif': 'Best compression (up to 90% reduction), modern browsers only',
    'webp': 'Good compression (up to 80% reduction), wide browser support',
    'jpeg': 'Universal compatibility, moderate compression (up to 70% reduction)',
    'original': 'Keeps the original format without conversion'
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-white/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Output Format Settings</h3>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                <Info className="h-3 w-3" />
                <span>Format info</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                AVIF: Best compression but limited browser support ({formatBrowserSupport.avif})<br />
                WebP: Good compression with great browser support ({formatBrowserSupport.webp})<br />
                JPEG: Universal compatibility ({formatBrowserSupport.jpeg})
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <Label htmlFor="output-format">Output Format Strategy</Label>
          <Select
            value={outputFormat}
            onValueChange={(value) => onOutputFormatChange(value as OutputFormat)}
            disabled={isProcessing}
          >
            <SelectTrigger id="output-format" className="mt-1">
              <SelectValue placeholder="Select output format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (AVIF → WebP → JPEG)</SelectItem>
              <SelectItem value="avif">AVIF Only</SelectItem>
              <SelectItem value="webp">WebP Only</SelectItem>
              <SelectItem value="jpeg">JPEG Only</SelectItem>
              <SelectItem value="original">Original Format</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDescription[outputFormat]}
          </p>
        </div>

        <div className="pt-2">
          <Label className="mb-4 block">Format Quality Settings</Label>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="jpeg-quality" className="text-sm">JPEG Quality</Label>
                <span className="text-xs">{compressionSettings.jpeg.quality}%</span>
              </div>
              <Slider
                id="jpeg-quality"
                min={0}
                max={100}
                step={1}
                value={[compressionSettings.jpeg.quality]}
                onValueChange={(value) => handleQualityChange('jpeg', value)}
                disabled={isProcessing}
                className="mt-1"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
              {estimatedSizes.jpeg !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated size: {(estimatedSizes.jpeg / 1024).toFixed(1)} KB 
                  ({estimatedSizes.original ? Math.round((1 - estimatedSizes.jpeg / estimatedSizes.original) * 100) : 0}% reduction)
                </p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Switch 
                  id="jpeg-progressive" 
                  checked={progressiveLoading}
                  onCheckedChange={onProgressiveLoadingChange}
                  disabled={isProcessing}
                />
                <Label htmlFor="jpeg-progressive" className="text-xs">Progressive loading</Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="webp-quality" className="text-sm">WebP Quality</Label>
                <span className="text-xs">{compressionSettings.webp.quality}%</span>
              </div>
              <Slider
                id="webp-quality"
                min={0}
                max={100}
                step={1}
                value={[compressionSettings.webp.quality]}
                onValueChange={(value) => handleQualityChange('webp', value)}
                disabled={isProcessing}
                className="mt-1"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
              {estimatedSizes.webp !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated size: {(estimatedSizes.webp / 1024).toFixed(1)} KB 
                  ({estimatedSizes.original ? Math.round((1 - estimatedSizes.webp / estimatedSizes.original) * 100) : 0}% reduction)
                </p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Switch 
                  id="webp-lossless" 
                  checked={compressionSettings.webp.lossless}
                  onCheckedChange={(checked) => handleLosslessChange('webp', checked)}
                  disabled={isProcessing}
                />
                <Label htmlFor="webp-lossless" className="text-xs">Lossless encoding</Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="avif-quality" className="text-sm">AVIF Quality</Label>
                <span className="text-xs">{compressionSettings.avif.quality}%</span>
              </div>
              <Slider
                id="avif-quality"
                min={0}
                max={100}
                step={1}
                value={[compressionSettings.avif.quality]}
                onValueChange={(value) => handleQualityChange('avif', value)}
                disabled={isProcessing}
                className="mt-1"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
              {estimatedSizes.avif !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated size: {(estimatedSizes.avif / 1024).toFixed(1)} KB 
                  ({estimatedSizes.original ? Math.round((1 - estimatedSizes.avif / estimatedSizes.original) * 100) : 0}% reduction)
                </p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Switch 
                  id="avif-lossless" 
                  checked={compressionSettings.avif.lossless}
                  onCheckedChange={(checked) => handleLosslessChange('avif', checked)}
                  disabled={isProcessing}
                />
                <Label htmlFor="avif-lossless" className="text-xs">Lossless encoding</Label>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Additional Options</Label>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Switch 
              id="strip-metadata" 
              checked={stripMetadata}
              onCheckedChange={onStripMetadataChange}
              disabled={isProcessing}
            />
            <div>
              <Label htmlFor="strip-metadata" className="text-xs">Strip metadata (EXIF)</Label>
              <p className="text-xs text-muted-foreground">Remove personal data and reduce file size</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatOptionsSection;
