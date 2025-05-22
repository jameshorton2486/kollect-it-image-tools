
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid, Image, Zap } from 'lucide-react';
import { WordPressPreset } from '@/types/imageProcessing';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WordPressPresetsSectionProps {
  onApplyPreset: (preset: WordPressPreset) => void;
}

const WordPressPresetsSection: React.FC<WordPressPresetsSectionProps> = ({ onApplyPreset }) => {
  const presets: WordPressPreset[] = [
    {
      id: 'thumbnail',
      name: 'Thumbnail',
      width: 150,
      height: 150,
      quality: 85,
      format: 'webp',
      description: 'Small thumbnail for listings and widgets'
    },
    {
      id: 'medium',
      name: 'Medium',
      width: 300,
      height: 300,
      quality: 85,
      format: 'webp',
      description: 'Medium size for blog posts and pages'
    },
    {
      id: 'medium_large',
      name: 'Medium Large',
      width: 768,
      height: 0,
      quality: 85,
      format: 'webp',
      description: 'Medium-large size for featured images'
    },
    {
      id: 'large',
      name: 'Large',
      width: 1024,
      height: 1024,
      quality: 82,
      format: 'webp',
      description: 'Large size for full-width content'
    },
    {
      id: 'shop_catalog',
      name: 'WooCommerce Product Catalog',
      width: 450,
      height: 450,
      quality: 90,
      format: 'webp',
      description: 'Product listings in WooCommerce'
    },
    {
      id: 'shop_single',
      name: 'WooCommerce Product Single',
      width: 800,
      height: 800,
      quality: 90,
      format: 'webp',
      description: 'Main product image on product pages'
    }
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-brand-dark">
          <Image className="h-5 w-5 text-brand-blue" />
          WordPress Image Presets
        </CardTitle>
        <CardDescription>
          Apply optimal settings for WordPress image sizes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 pr-4">
          <div className="grid grid-cols-1 gap-3">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                className="flex justify-between items-center h-auto py-3 px-4 hover:bg-muted/50 text-left"
                onClick={() => onApplyPreset(preset)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </div>
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span>{preset.width} × {preset.height === 0 ? 'auto' : preset.height}</span>
                  <span>{preset.format.toUpperCase()} · {preset.quality}%</span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WordPressPresetsSection;
