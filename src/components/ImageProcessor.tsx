
import React from 'react';
import MainProcessor from './ImageProcessing/MainProcessor';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
  return <MainProcessor images={images} onReset={onReset} />;
};

export default ImageProcessor;
