
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Crop, Image, FileCode } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { WordPressPreset } from '@/types/imageProcessing';

interface WordPressPresetsSectionProps {
  onApplyPreset: (preset: WordPressPreset) => void;
}

const WordPressPresetsSection: React.FC<WordPressPresetsSectionProps> = ({ onApplyPreset }) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  const wordpressPresets: WordPressPreset[] = [
    {
      name: "Blog Images",
      description: "Optimized for article featured images and in-content images",
      sizes: {
        thumbnail: { width: 150, height: 150 },
        medium: { width: 300, height: 300 },
        large: { width: 768, height: 768 },
        full: { width: 1200, height: 1200 },
      },
      compressionSettings: {
        jpeg: { quality: 80 },
        webp: { quality: 75, lossless: false },
        avif: { quality: 70, lossless: false }
      },
      stripMetadata: true,
      progressiveLoading: true,
      outputFormat: 'auto'
    },
    {
      name: "Product Photos",
      description: "High quality images for e-commerce products",
      sizes: {
        thumbnail: { width: 300, height: 300 },
        medium: { width: 600, height: 600 },
        large: { width: 1200, height: 1200 },
        full: { width: 2000, height: 2000 },
      },
      compressionSettings: {
        jpeg: { quality: 90 },
        webp: { quality: 85, lossless: false },
        avif: { quality: 80, lossless: false }
      },
      stripMetadata: true,
      progressiveLoading: true,
      outputFormat: 'auto'
    },
    {
      name: "Hero Images",
      description: "Large banner and header images",
      sizes: {
        thumbnail: { width: 300, height: 100 },
        medium: { width: 768, height: 256 },
        large: { width: 1536, height: 512 },
        full: { width: 1920, height: 640 },
      },
      compressionSettings: {
        jpeg: { quality: 85 },
        webp: { quality: 80, lossless: false },
        avif: { quality: 75, lossless: false }
      },
      stripMetadata: true,
      progressiveLoading: true,
      outputFormat: 'auto'
    },
    {
      name: "Thumbnails",
      description: "Small images for listings and previews",
      sizes: {
        thumbnail: { width: 100, height: 100 },
        medium: { width: 200, height: 200 },
        large: { width: 300, height: 300 },
        full: { width: 400, height: 400 },
      },
      compressionSettings: {
        jpeg: { quality: 75 },
        webp: { quality: 70, lossless: false },
        avif: { quality: 65, lossless: false }
      },
      stripMetadata: true,
      progressiveLoading: false,
      outputFormat: 'auto'
    },
    {
      name: "Max Quality",
      description: "Minimal compression, best quality",
      sizes: {
        thumbnail: { width: 300, height: 300 },
        medium: { width: 800, height: 800 },
        large: { width: 1600, height: 1600 },
        full: { width: 2400, height: 2400 },
      },
      compressionSettings: {
        jpeg: { quality: 95 },
        webp: { quality: 90, lossless: true },
        avif: { quality: 85, lossless: true }
      },
      stripMetadata: false,
      progressiveLoading: true,
      outputFormat: 'webp'
    },
    {
      name: "Under 100KB",
      description: "Target size-optimized images",
      sizes: {
        thumbnail: { width: 100, height: 100 },
        medium: { width: 300, height: 300 },
        large: { width: 600, height: 600 },
        full: { width: 800, height: 800 },
      },
      compressionSettings: {
        jpeg: { quality: 65 },
        webp: { quality: 60, lossless: false },
        avif: { quality: 55, lossless: false }
      },
      stripMetadata: true,
      progressiveLoading: false,
      outputFormat: 'avif'
    }
  ];

  const handlePresetClick = (preset: WordPressPreset) => {
    setActivePreset(preset.name);
    onApplyPreset(preset);
  };

  return (
    <div className="space-y-3 border rounded-md p-4 bg-white/50 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4" />
          <h3 className="text-sm font-medium">WordPress Optimization Presets</h3>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {wordpressPresets.map((preset) => (
          <TooltipProvider key={preset.name} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full h-auto py-2 flex flex-col items-center justify-center gap-1 ${
                    activePreset === preset.name ? 'bg-brand-light text-brand-blue border border-brand-blue' : ''
                  }`}
                  onClick={() => handlePresetClick(preset)}
                >
                  <span className="text-xs font-medium">{preset.name}</span>
                  <div className="flex items-center justify-center gap-1">
                    <Image className="h-3 w-3 opacity-60" />
                    <span className="text-xs opacity-70">
                      {preset.sizes.full.width}×{preset.sizes.full.height}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] mt-1 px-1 py-0 h-4">
                    {preset.outputFormat === 'auto' 
                      ? 'AVIF → WebP → JPEG' 
                      : preset.outputFormat.toUpperCase()}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs w-64">
                <p className="font-semibold">{preset.name}</p>
                <p>{preset.description}</p>
                <div className="mt-1">
                  <p>JPEG: {preset.compressionSettings.jpeg.quality}% quality</p>
                  <p>WebP: {preset.compressionSettings.webp.quality}% quality</p>
                  <p>AVIF: {preset.compressionSettings.avif.quality}% quality</p>
                  <p className="mt-1">
                    {preset.stripMetadata ? '✓ Strip metadata' : '× Keep metadata'}
                    {' | '}
                    {preset.progressiveLoading ? '✓ Progressive loading' : '× Standard loading'}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default WordPressPresetsSection;
