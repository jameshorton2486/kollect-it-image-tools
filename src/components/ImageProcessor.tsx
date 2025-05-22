
import React from 'react';
import { Card } from '@/components/ui/card';
import MainProcessor from './ImageProcessing/MainProcessor';
import DirectorySourceSection from './ImageProcessing/SourceDirectory/DirectorySourceSection';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
  const [allImages, setAllImages] = React.useState<File[]>(images);
  
  // Function to add more images from the directory source
  const handleMoreImagesSelected = (newImages: File[]) => {
    setAllImages(prevImages => [...prevImages, ...newImages]);
  };
  
  return (
    <div className="space-y-6">
      <DirectorySourceSection 
        onImagesSelected={handleMoreImagesSelected}
        isProcessing={false} // You'll need to pass this from the MainProcessor
      />
      <MainProcessor images={allImages} onReset={onReset} />
    </div>
  );
};

export default ImageProcessor;
