
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ResizeMode, ResizeUnit, WORDPRESS_SIZE_PRESETS } from '@/types/imageResizing';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Crop, Maximize, Square } from 'lucide-react';
import { ProcessedImage } from '@/types/imageProcessing';
import ResizePreviewSection from './ResizePreviewSection';

interface ResizeOptionsSectionProps {
  width: number;
  height: number;
  preserveAspectRatio: boolean;
  quality: number;
  resizeMode: ResizeMode;
  resizeUnit: ResizeUnit;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onPreserveAspectRatioChange: (value: boolean) => void;
  onQualityChange: (value: number) => void;
  onResizeModeChange: (value: ResizeMode) => void;
  onResizeUnitChange: (value: ResizeUnit) => void;
  onApplyWordPressPreset: (preset: string) => void;
  estimatedFileSize?: number;
  selectedImage?: ProcessedImage | null;
}

const ResizeOptionsSection: React.FC<ResizeOptionsSectionProps> = ({
  width,
  height,
  preserveAspectRatio,
  quality,
  resizeMode,
  resizeUnit,
  onWidthChange,
  onHeightChange,
  onPreserveAspectRatioChange,
  onQualityChange,
  onResizeModeChange,
  onResizeUnitChange,
  onApplyWordPressPreset,
  estimatedFileSize,
  selectedImage
}) => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(width);
  const [originalHeight, setOriginalHeight] = useState<number>(height);

  // Calculate aspect ratio when component mounts or when width/height changes
  useEffect(() => {
    if (width && height) {
      setAspectRatio(width / height);
    }
  }, [width, height]);

  // Update original dimensions when a new image is loaded
  useEffect(() => {
    if (selectedImage?.dimensions) {
      setOriginalWidth(selectedImage.dimensions.width);
      setOriginalHeight(selectedImage.dimensions.height);
    }
  }, [selectedImage]);

  // Handle width change while preserving aspect ratio
  const handleWidthChange = (newWidth: number) => {
    onWidthChange(newWidth);
    
    if (preserveAspectRatio && aspectRatio && newWidth > 0) {
      const calculatedHeight = Math.round(newWidth / aspectRatio);
      onHeightChange(calculatedHeight);
    }
  };

  // Handle height change while preserving aspect ratio  
  const handleHeightChange = (newHeight: number) => {
    onHeightChange(newHeight);
    
    if (preserveAspectRatio && aspectRatio && newHeight > 0) {
      const calculatedWidth = Math.round(newHeight * aspectRatio);
      onWidthChange(calculatedWidth);
    }
  };

  // Reset dimensions to original
  const handleResetDimensions = () => {
    onWidthChange(originalWidth);
    onHeightChange(originalHeight);
  };

  // Render icons for resize modes
  const getResizeModeIcon = (mode: ResizeMode) => {
    switch (mode) {
      case 'fit': return <Maximize className="h-4 w-4" />;
      case 'fill': return <Square className="h-4 w-4" />;
      case 'stretch': return <Maximize className="h-4 w-4" />;
      case 'crop': return <Crop className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Add the preview section with before/after slider */}
      <ResizePreviewSection 
        selectedImage={selectedImage || null}
        originalWidth={originalWidth}
        originalHeight={originalHeight}
        resizedWidth={width}
        resizedHeight={height}
        onWidthChange={handleWidthChange}
        onHeightChange={handleHeightChange}
        onResetDimensions={handleResetDimensions}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Resize Options</span>
            {estimatedFileSize && (
              <Badge variant="secondary">
                Est. Size: {(estimatedFileSize / 1024).toFixed(1)} KB
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Dimensions Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Dimensions</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="preserve-ratio" className="text-sm">Lock Aspect Ratio</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="preserve-ratio"
                      checked={preserveAspectRatio}
                      onCheckedChange={onPreserveAspectRatioChange}
                    />
                    {preserveAspectRatio ? 
                      <Lock className="h-4 w-4 text-primary" /> : 
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="width"
                      type="number"
                      min="1"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value || "0", 10))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="height"
                      type="number"
                      min="1"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value || "0", 10))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Unit Selector */}
              <div className="space-y-2">
                <Label htmlFor="resize-unit">Unit</Label>
                <Select value={resizeUnit} onValueChange={(value) => onResizeUnitChange(value as ResizeUnit)}>
                  <SelectTrigger id="resize-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="px">Pixels (px)</SelectItem>
                      <SelectItem value="%">Percentage (%)</SelectItem>
                      <SelectItem value="in">Inches (in)</SelectItem>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Resize Mode Selector */}
            <div className="space-y-4">
              <Label htmlFor="resize-mode">Resize Mode</Label>
              <Select value={resizeMode} onValueChange={(value) => onResizeModeChange(value as ResizeMode)}>
                <SelectTrigger id="resize-mode">
                  <SelectValue placeholder="Select resize mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="fit">
                      <div className="flex items-center gap-2">
                        {getResizeModeIcon('fit')}
                        <span>Fit - Preserve ratio, no crop</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fill">
                      <div className="flex items-center gap-2">
                        {getResizeModeIcon('fill')}
                        <span>Fill - Cover area, may crop</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="stretch">
                      <div className="flex items-center gap-2">
                        {getResizeModeIcon('stretch')}
                        <span>Stretch - Exact dimensions</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="crop">
                      <div className="flex items-center gap-2">
                        {getResizeModeIcon('crop')}
                        <span>Crop - Smart center crop</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Separator />
            
            {/* Quality Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="quality">Quality</Label>
                <span className="text-sm text-muted-foreground">{quality}%</span>
              </div>
              <Slider
                id="quality"
                min={1}
                max={100}
                step={1}
                value={[quality]}
                onValueChange={([value]) => onQualityChange(value)}
              />
              <div className="flex text-xs justify-between">
                <span>Low quality (small file)</span>
                <span>High quality (large file)</span>
              </div>
            </div>

            <Separator />

            {/* WordPress Preset Buttons */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">WordPress Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(WORDPRESS_SIZE_PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyWordPressPreset(key)}
                    className="justify-start"
                  >
                    <div className="flex flex-col items-start">
                      <span>{preset.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {preset.width}×{preset.height || 'auto'}
                        {preset.crop && ", Crop"}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ResizeOptionsSection;
