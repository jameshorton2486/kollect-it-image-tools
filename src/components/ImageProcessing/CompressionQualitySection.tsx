
import React from 'react';
import { Slider } from "@/components/ui/slider";

interface CompressionQualityProps {
  compressionLevel: number;
  onCompressionLevelChange: (value: number) => void;
}

const CompressionQualitySection: React.FC<CompressionQualityProps> = ({
  compressionLevel,
  onCompressionLevelChange
}) => {
  return (
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
  );
};

export default CompressionQualitySection;
