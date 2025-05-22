
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Scissors, Crop } from "lucide-react";
import EcommercePresetsSection from './EcommercePresetsSection';

interface DimensionsSectionProps {
  maxWidth: number;
  maxHeight: number;
  preserveAspectRatio: boolean;
  onMaxWidthChange: (value: number) => void;
  onMaxHeightChange: (value: number) => void;
  onPreserveAspectRatioChange: (value: boolean) => void;
}

const DimensionsSection: React.FC<DimensionsSectionProps> = ({
  maxWidth,
  maxHeight,
  preserveAspectRatio,
  onMaxWidthChange,
  onMaxHeightChange,
  onPreserveAspectRatioChange
}) => {
  const [customWidth, setCustomWidth] = useState<string>(maxWidth.toString());
  const [customHeight, setCustomHeight] = useState<string>(maxHeight.toString());
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleApplyCustomDimensions = () => {
    const width = parseInt(customWidth, 10);
    const height = parseInt(customHeight, 10);
    
    if (!isNaN(width) && width >= 100 && width <= 3000) {
      onMaxWidthChange(width);
    }
    
    if (!isNaN(height) && height >= 100 && height <= 3000) {
      onMaxHeightChange(height);
    }
    
    setDialogOpen(false);
  };
  
  // Handler for applying e-commerce presets
  const handleApplyPreset = (width: number, height: number) => {
    onMaxWidthChange(width);
    onMaxHeightChange(height);
    setCustomWidth(width.toString());
    setCustomHeight(height.toString());
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Image Dimensions</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Scissors className="h-4 w-4" />
              Custom Size
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Custom Dimensions</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="custom-width" className="text-sm font-medium">Width (px)</label>
                  <Input
                    id="custom-width"
                    type="number"
                    min="100"
                    max="3000"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="custom-height" className="text-sm font-medium">Height (px)</label>
                  <Input
                    id="custom-height"
                    type="number"
                    min="100"
                    max="3000"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Note: Values must be between 100px and 3000px
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleApplyCustomDimensions}>Apply Dimensions</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* E-commerce Presets Section */}
      <EcommercePresetsSection onApplyPreset={handleApplyPreset} />
      
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
    </div>
  );
};

export default DimensionsSection;
