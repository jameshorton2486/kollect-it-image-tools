
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

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
  return (
    <>
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
    </>
  );
};

export default DimensionsSection;
