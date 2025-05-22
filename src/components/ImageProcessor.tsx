
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
    try {
      const folderStructure = ensureFolderStructure();
      console.log('Google Drive folder structure initialized:', folderStructure);
    } catch (error) {
      console.error('Failed to initialize folder structure:', error);
    }
  }, []);
  
  // Function to add more images from the directory source
  const handleMoreImagesSelected = (newImages: File[]) => {
    if (!newImages || newImages.length === 0) return;
    setAllImages(prevImages => [...prevImages, ...newImages]);
  };

  // Update parent component's processing state when local state changes
  React.useEffect(() => {
    if (onProcessingStateChange) {
      onProcessingStateChange(isProcessing);
    }
  }, [isProcessing, onProcessingStateChange]);
  
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden shadow-md border-border">
          <DirectorySourceSection 
            onImagesSelected={handleMoreImagesSelected}
            isProcessing={isProcessing}
          />
        </Card>
        
        <MainProcessor 
          images={allImages} 
          onReset={onReset}
          onProcessingStateChange={setIsProcessing} 
        />
      </div>
    </div>
  );
};

export default ImageProcessor;
