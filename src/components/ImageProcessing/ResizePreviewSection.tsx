import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Maximize, MinusSquare, Move, PlusSquare, RotateCcw, ArrowLeftRight, Grid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProcessedImage } from '@/types/imageProcessing';

interface ResizePreviewSectionProps {
  selectedImage: ProcessedImage | null;
  originalWidth: number;
  originalHeight: number;
  resizedWidth: number;
  resizedHeight: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onResetDimensions: () => void;
}

const ResizePreviewSection: React.FC<ResizePreviewSectionProps> = ({
  selectedImage,
  originalWidth,
  originalHeight,
  resizedWidth,
  resizedHeight,
  onWidthChange,
  onHeightChange,
  onResetDimensions
}) => {
  const [comparePosition, setComparePosition] = useState<number>(50);
  const [zoom, setZoom] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Calculate the aspect ratio
  const aspectRatio = originalWidth / originalHeight;
  
  // Common aspect ratios
  const aspectRatios = {
    "1:1": 1,
    "4:3": 4/3,
    "3:2": 3/2,
    "16:9": 16/9,
  };
  
  // Percentage scaling presets
  const scalePresets = [25, 50, 75, 100, 150, 200];
  
  // Apply aspect ratio
  const applyAspectRatio = (ratio: number) => {
    // Keep the current width and adjust height based on the ratio
    const newHeight = Math.round(resizedWidth / ratio);
    onHeightChange(newHeight);
  };
  
  // Apply scale preset
  const applyScalePreset = (percentage: number) => {
    const scaleFactor = percentage / 100;
    onWidthChange(Math.round(originalWidth * scaleFactor));
    onHeightChange(Math.round(originalHeight * scaleFactor));
  };
  
  // Swap height and width
  const swapDimensions = () => {
    onWidthChange(resizedHeight);
    onHeightChange(resizedWidth);
  };

  // Handle slider movement for before/after preview
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!previewContainerRef.current || !isDragging) return;
    
    const rect = previewContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setComparePosition(x);
  };

  if (!selectedImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Image Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 bg-gray-100">
          <p className="text-muted-foreground">Please select an image to preview</p>
        </CardContent>
      </Card>
    );
  }

  // Get preview URLs
  const originalPreviewUrl = selectedImage.preview;
  const processedPreviewUrl = selectedImage.processed ? URL.createObjectURL(selectedImage.processed) : selectedImage.preview;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Image Preview</span>
          <div className="flex gap-2">
            <Badge variant="outline">
              Original: {originalWidth}×{originalHeight}
            </Badge>
            <Badge variant="outline">
              Resized: {resizedWidth}×{resizedHeight}
            </Badge>
            <Badge variant="outline">
              Zoom: {zoom}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Preview Controls */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(zoom + 25, 200))}
              title="Zoom In"
            >
              <PlusSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(zoom - 25, 25))}
              title="Zoom Out"
            >
              <MinusSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(100)}
              title="Reset Zoom"
            >
              <Maximize className="h-4 w-4" />
            </Button>
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle Grid"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={swapDimensions}
              title="Swap Width & Height"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetDimensions}
              title="Reset to Original"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Before/After Preview Slider */}
          <div 
            ref={previewContainerRef}
            className="relative h-[400px] overflow-hidden border rounded-md"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
          >
            {/* Original Image (Before) */}
            <div 
              className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${originalPreviewUrl})`,
                backgroundSize: `${zoom}%`,
                backgroundPosition: 'center'
              }}
            >
              {showGrid && (
                <div className="absolute inset-0 bg-grid-overlay pointer-events-none"></div>
              )}
            </div>
            
            {/* Processed Image (After) - Show only the portion determined by comparePosition */}
            <div 
              className="absolute top-0 left-0 h-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${processedPreviewUrl})`,
                width: `${comparePosition}%`,
                backgroundSize: `${zoom}%`,
                backgroundPosition: 'center',
                borderRight: '2px solid white'
              }}
            >
              {showGrid && (
                <div className="absolute inset-0 bg-grid-overlay pointer-events-none"></div>
              )}
            </div>
            
            {/* Slider handle */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
              style={{ left: `${comparePosition}%`, marginLeft: '-1px' }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                <Move className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            
            {/* Labels */}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Before</div>
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">After</div>
          </div>
          
          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Zoom</span>
              <span className="text-sm">{zoom}%</span>
            </div>
            <Slider
              value={[zoom]}
              min={25}
              max={200}
              step={5}
              onValueChange={([value]) => setZoom(value)}
            />
          </div>
          
          {/* Aspect Ratio Presets */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Aspect Ratio</h3>
            <ToggleGroup type="single" className="justify-start">
              {Object.entries(aspectRatios).map(([name, ratio]) => (
                <ToggleGroupItem 
                  key={name} 
                  value={name}
                  onClick={() => applyAspectRatio(ratio)}
                  className="text-xs"
                >
                  {name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          
          {/* Scaling Presets */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Scaling Presets</h3>
            <div className="flex flex-wrap gap-2">
              {scalePresets.map(scale => (
                <Button
                  key={scale}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => applyScalePreset(scale)}
                >
                  {scale}%
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResizePreviewSection;
