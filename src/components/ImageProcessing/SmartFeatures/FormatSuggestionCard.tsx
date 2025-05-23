
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from 'lucide-react';
import { ProcessedImage } from '@/types/imageProcessing';

interface FormatSuggestionCardProps {
  image: ProcessedImage;
  currentFormat: string;
  imageType: 'photo' | 'graphic' | 'screenshot' | 'unknown';
}

const FormatSuggestionCard: React.FC<FormatSuggestionCardProps> = ({
  image,
  currentFormat,
  imageType
}) => {
  // Get the best format recommendation based on image type
  const getBestFormatRecommendation = () => {
    // Check if image has transparency
    let hasTransparency = false;
    if (image.original.type === 'image/png') {
      // We assume PNGs might have transparency
      hasTransparency = true;
    }
    
    // Make recommendations based on image type and transparency
    if (hasTransparency) {
      return {
        primary: 'webp',
        fallback: 'png',
        reason: 'This image may have transparency. WebP offers better compression than PNG while preserving transparency.'
      };
    }
    
    switch (imageType) {
      case 'photo':
        return {
          primary: 'webp',
          fallback: 'jpeg',
          reason: 'Photos compress well with WebP, with JPEG as a good fallback for older browsers.'
        };
      case 'graphic':
        return {
          primary: 'webp',
          fallback: 'png',
          reason: 'Graphics with limited colors compress effectively with WebP.'
        };
      case 'screenshot':
        return {
          primary: 'webp',
          fallback: 'jpeg',
          reason: 'Screenshots typically compress well with WebP.'
        };
      default:
        return {
          primary: 'webp',
          fallback: 'jpeg',
          reason: 'WebP offers the best balance between quality and file size for most images.'
        };
    }
  };
  
  const recommendation = getBestFormatRecommendation();
  
  // Only show if the current format differs from the recommendation
  if (currentFormat === recommendation.primary) {
    return null;
  }

  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-3 flex gap-2">
        <Lightbulb className="h-4 w-4 text-warning-amber mt-0.5" />
        <div>
          <div className="text-xs font-medium">Format Suggestion</div>
          <p className="text-xs text-sage-gray">{recommendation.reason}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormatSuggestionCard;
