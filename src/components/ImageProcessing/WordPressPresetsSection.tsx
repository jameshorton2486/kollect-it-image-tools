import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, ImagePlus, MonitorSmartphone, Newspaper, Store, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WordPressPreset } from '@/types/imageProcessing';

interface WordPressPresetsSectionProps {
  onPresetSelect: (preset: WordPressPreset) => void;
  className?: string;
}

const WordPressPresetsSection: React.FC<WordPressPresetsSectionProps> = ({ onPresetSelect, className }) => {
  const presets: WordPressPreset[] = [
    {
      name: "WooCommerce Product",
      width: 800,
      height: 800,
      quality: 85,
      formats: ["webp", "jpeg"],
      stripMetadata: true,
      description: "Optimized for product listings and detail pages",
      sizes: [
        { width: 800, height: 800 },
        { width: 400, height: 400 },
        { width: 200, height: 200 }
      ],
      outputFormat: "webp",
      compressionSettings: {
        webp: { quality: 85, lossless: false },
        jpeg: { quality: 80, progressive: true },
        avif: { quality: 70, lossless: false }
      },
      progressiveLoading: true
    },
    {
      name: "Hero Banner",
      width: 1920,
      height: 1080,
      quality: 80,
      formats: ["webp", "jpeg"],
      stripMetadata: true,
      description: "Full-width header images for maximum impact",
      sizes: [
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 },
        { width: 768, height: 432 }
      ],
      outputFormat: "webp",
      compressionSettings: {
        webp: { quality: 80, lossless: false },
        jpeg: { quality: 75, progressive: true },
        avif: { quality: 65, lossless: false }
      },
      progressiveLoading: true
    },
    {
      name: "Blog Featured",
      width: 1200,
      height: 630,
      quality: 82,
      formats: ["webp", "jpeg"],
      stripMetadata: true,
      description: "Optimized for blog posts and social sharing",
      sizes: [
        { width: 1200, height: 630 },
        { width: 800, height: 420 },
        { width: 600, height: 315 }
      ],
      outputFormat: "webp",
      compressionSettings: {
        webp: { quality: 82, lossless: false },
        jpeg: { quality: 78, progressive: true },
        avif: { quality: 68, lossless: false }
      },
      progressiveLoading: true
    },
    {
      name: "Gallery Image",
      width: 600,
      height: 600,
      quality: 85,
      formats: ["webp", "jpeg"],
      stripMetadata: true,
      description: "Perfect for image galleries and lightboxes",
      sizes: [
        { width: 600, height: 600 },
        { width: 300, height: 300 }
      ],
      outputFormat: "webp",
      compressionSettings: {
        webp: { quality: 85, lossless: false },
        jpeg: { quality: 80, progressive: true },
        avif: { quality: 70, lossless: false }
      },
      progressiveLoading: true
    },
    {
      name: "Logo & Icon",
      width: 512,
      height: 512,
      quality: 90,
      formats: ["webp", "png"],
      stripMetadata: false,
      description: "Preserve transparency for logos and icons",
      sizes: [
        { width: 512, height: 512 },
        { width: 256, height: 256 },
        { width: 128, height: 128 }
      ],
      outputFormat: "webp",
      compressionSettings: {
        webp: { quality: 90, lossless: true },
        jpeg: { quality: 85, progressive: false },
        avif: { quality: 80, lossless: true }
      },
      progressiveLoading: false
    },
    {
      name: "Background",
      width: 1920,
      height: 1080,
      quality: 75,
      formats: ["webp", "jpeg"],
      stripMetadata: true,
      description: "Lightweight background images for faster loading",
      sizes: [
        { width: 1920, height: 1080 },
        { width: 1280, height: 720 }
      ],
      outputFormat: "webp",
      compressionSettings: {
        webp: { quality: 75, lossless: false },
        jpeg: { quality: 70, progressive: true },
        avif: { quality: 60, lossless: false }
      },
      progressiveLoading: true
    }
  ];

  const getIcon = (presetName: string) => {
    switch (presetName) {
      case "WooCommerce Product":
        return <Store className="h-4 w-4 mr-2" />;
      case "Hero Banner":
        return <MonitorSmartphone className="h-4 w-4 mr-2" />;
      case "Blog Featured":
        return <Newspaper className="h-4 w-4 mr-2" />;
      case "Gallery Image":
        return <ImagePlus className="h-4 w-4 mr-2" />;
      case "Logo & Icon":
        return <PlayCircle className="h-4 w-4 mr-2" />;
      case "Background":
        return <Image className="h-4 w-4 mr-2" />;
      default:
        return <Settings className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>WordPress Presets</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            className="justify-start text-sm w-full"
            onClick={() => onPresetSelect(preset)}
          >
            <div className="flex items-center">
              {getIcon(preset.name)}
              <span>{preset.name}</span>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default WordPressPresetsSection;
