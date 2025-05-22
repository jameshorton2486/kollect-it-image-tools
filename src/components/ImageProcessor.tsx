
import React from 'react';
import { Card } from '@/components/ui/card';
import MainProcessor from './ImageProcessing/MainProcessor';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
  return (
    <div className="space-y-6">
      <MainProcessor images={images} onReset={onReset} />
    </div>
  );
};

export default ImageProcessor;
