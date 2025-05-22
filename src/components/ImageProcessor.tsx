
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import MainProcessor from './ImageProcessing/MainProcessor';
import DirectorySourceSection from './ImageProcessing/SourceDirectory/DirectorySourceSection';
import { ensureFolderStructure } from '@/utils/googleDriveUtils';
import '../styles/gridOverlay.css';
import { ImageProcessorProps } from '@/types/imageProcessing';
import { normalizeProcessedImage } from '@/utils/imageProcessing/batchProcessingHelper';

const ImageProcessor: React.FC<ImageProcessorProps> = ({ 
  images, 
  onReset,
  onProcessingStateChange 
}) => {
  const [allImages, setAllImages] = React.useState<File[]>(images);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  
  // Initialize Google Drive folder structure on component mount
  useEffect(() => {
    const folderStructure = ensureFolderStructure();
    console.log('Google Drive folder structure initialized:', folderStructure);
  }, []);
  
  // Function to add more images from the directory source
  const handleMoreImagesSelected = (newImages: File[]) => {
    setAllImages(prevImages => [...prevImages, ...newImages]);
  };

  // Update parent component's processing state when local state changes
  React.useEffect(() => {
    if (onProcessingStateChange) {
      onProcessingStateChange(isProcessing);
    }
  }, [isProcessing, onProcessingStateChange]);
  
  return (
    <div className="space-y-6">
      <DirectorySourceSection 
        onImagesSelected={handleMoreImagesSelected}
        isProcessing={isProcessing}
      />
      <MainProcessor 
        images={allImages} 
        onReset={onReset}
        onProcessingStateChange={setIsProcessing} 
      />
    </div>
  );
};

export default ImageProcessor;
