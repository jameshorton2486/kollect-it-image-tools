
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import MainProcessor from './ImageProcessing/MainProcessor';
import DirectorySourceSection from './ImageProcessing/SourceDirectory/DirectorySourceSection';
import { ensureFolderStructure } from '@/utils/googleDriveUtils';
import '../styles/gridOverlay.css';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
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
