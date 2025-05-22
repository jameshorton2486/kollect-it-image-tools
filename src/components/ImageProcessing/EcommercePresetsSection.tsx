
import React from 'react';
import { Button } from "@/components/ui/button";
import { Crop, Image } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface EcommercePreset {
  name: string;
  width: number;
  height: number;
  platform: string;
  description?: string;
}

interface EcommercePresetsSectionProps {
  onApplyPreset: (width: number, height: number) => void;
}

const EcommercePresetsSection: React.FC<EcommercePresetsSectionProps> = ({ onApplyPreset }) => {
  const commonPresets: EcommercePreset[] = [
    { name: "Square Small", width: 500, height: 500, platform: "WooCommerce, Etsy", description: "Small product thumbnails" },
    { name: "Square Medium", width: 1000, height: 1000, platform: "WooCommerce, Amazon", description: "Standard product images" },
    { name: "Square Large", width: 2000, height: 2000, platform: "High-resolution", description: "Zoom-capable product images" },
    { name: "Rectangle", width: 1200, height: 800, platform: "Landscape format", description: "Feature images, banners" },
    { name: "Tall", width: 800, height: 1200, platform: "Portrait format", description: "Mobile-optimized products" }
  ];

  return (
    <div className="space-y-3 border rounded-md p-4 bg-white/50 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crop className="h-4 w-4" />
          <h3 className="text-sm font-medium">E-commerce Presets</h3>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {commonPresets.map((preset) => (
          <TooltipProvider key={preset.name} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-auto py-2 flex flex-col items-center justify-center gap-1"
                  onClick={() => onApplyPreset(preset.width, preset.height)}
                >
                  <span className="text-xs font-medium">{preset.name}</span>
                  <div className="flex items-center justify-center gap-1">
                    <Image className="h-3 w-3 opacity-60" />
                    <span className="text-xs opacity-70">{preset.width}×{preset.height}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] mt-1 px-1 py-0 h-4">
                    {preset.platform}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{preset.description}</p>
                <p className="font-semibold mt-1">Dimensions: {preset.width}×{preset.height}px</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default EcommercePresetsSection;
