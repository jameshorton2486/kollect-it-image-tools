
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
  const [processedImages, setProcessedImages] = useState<{
    original: File;
    processed: File | null;
    preview: string;
    isProcessing: boolean;
    isSelected: boolean;
  }[]>([]);
  
  const [compressionLevel, setCompressionLevel] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1200);
  const [maxHeight, setMaxHeight] = useState<number>(1200);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Initialize images on mount
  React.useEffect(() => {
    if (images.length > 0) {
      const initialImages = images.map(file => ({
        original: file,
        processed: null,
        preview: URL.createObjectURL(file),
        isProcessing: false,
        isSelected: true,
      }));
      
      setProcessedImages(initialImages);
    }
  }, [images]);
  
  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      processedImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);
  
  const compressImage = async (file: File, options: imageCompression.Options) => {
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error(`Failed to compress ${file.name}`);
      return null;
    }
  };
  
  const processImage = useCallback(async (index: number) => {
    const image = processedImages[index];
    if (!image || image.isProcessing) return;
    
    const updatedImages = [...processedImages];
    updatedImages[index].isProcessing = true;
    setProcessedImages(updatedImages);
    
    try {
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: Math.max(maxWidth, maxHeight),
        useWebWorker: true,
        initialQuality: compressionLevel / 100,
      };
      
      const processedFile = await compressImage(image.original, compressionOptions);
      
      if (processedFile) {
        const previewUrl = URL.createObjectURL(processedFile);
        
        updatedImages[index] = {
          ...updatedImages[index],
          processed: processedFile,
          preview: previewUrl,
          isProcessing: false,
        };
        
        setProcessedImages(updatedImages);
        toast.success(`Processed ${image.original.name}`);
      } else {
        updatedImages[index].isProcessing = false;
        setProcessedImages(updatedImages);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error(`Failed to process ${image.original.name}`);
      
      updatedImages[index].isProcessing = false;
      setProcessedImages(updatedImages);
    }
  }, [processedImages, compressionLevel, maxWidth, maxHeight]);
  
  const processAllImages = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const selectedImages = processedImages.filter(img => img.isSelected);
      
      if (selectedImages.length === 0) {
        toast.info("No images selected for processing");
        setIsProcessing(false);
        return;
      }
      
      for (let i = 0; i < processedImages.length; i++) {
        if (processedImages[i].isSelected) {
          await processImage(i);
        }
      }
      
      toast.success("All selected images processed successfully!");
    } catch (error) {
      console.error("Error in batch processing:", error);
      toast.error("Failed to process some images");
    } finally {
      setIsProcessing(false);
    }
  }, [processedImages, processImage, isProcessing]);
  
  const downloadImage = useCallback((index: number) => {
    const image = processedImages[index];
    if (!image || !image.processed) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(image.processed);
    link.download = `optimized-${image.original.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    toast.success(`Downloaded ${image.original.name}`);
  }, [processedImages]);
  
  const downloadAllImages = useCallback(() => {
    const selectedImages = processedImages.filter(img => img.isSelected && img.processed);
    
    if (selectedImages.length === 0) {
      toast.info("No processed images to download");
      return;
    }
    
    selectedImages.forEach((image, index) => {
      setTimeout(() => {
        if (image.processed) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(image.processed);
          link.download = `optimized-${image.original.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
      }, index * 100); // Stagger downloads slightly
    });
    
    toast.success(`Downloading ${selectedImages.length} images`);
  }, [processedImages]);
  
  const toggleSelectImage = useCallback((index: number) => {
    const updatedImages = [...processedImages];
    updatedImages[index].isSelected = !updatedImages[index].isSelected;
    setProcessedImages(updatedImages);
  }, [processedImages]);
  
  const selectAllImages = useCallback((selected: boolean) => {
    const updatedImages = processedImages.map(img => ({
      ...img,
      isSelected: selected
    }));
    setProcessedImages(updatedImages);
  }, [processedImages]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Image Processing Settings</span>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Compression Quality: {compressionLevel}%</span>
              </div>
              <Slider
                value={[compressionLevel]} 
                min={1}
                max={100}
                step={1}
                onValueChange={(value) => setCompressionLevel(value[0])}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Max Width: {maxWidth}px</span>
                </div>
                <Slider
                  value={[maxWidth]} 
                  min={100}
                  max={3000}
                  step={50}
                  onValueChange={(value) => setMaxWidth(value[0])}
                  disabled={!preserveAspectRatio}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Max Height: {maxHeight}px</span>
                </div>
                <Slider
                  value={[maxHeight]} 
                  min={100}
                  max={3000}
                  step={50}
                  onValueChange={(value) => setMaxHeight(value[0])}
                  disabled={!preserveAspectRatio}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserveAspect"
                checked={preserveAspectRatio}
                onCheckedChange={(checked) => setPreserveAspectRatio(checked as boolean)}
              />
              <label
                htmlFor="preserveAspect"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Preserve aspect ratio
              </label>
            </div>
            
            <div className="flex justify-between pt-4">
              <div className="space-x-2">
                <Button
                  variant="default"
                  onClick={processAllImages}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Process All Selected'}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadAllImages}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </div>
              
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAllImages(true)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectAllImages(false)}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {processedImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {processedImages.map((img, index) => (
            <Card 
              key={index}
              className={`overflow-hidden ${img.isSelected ? 'ring-2 ring-brand-blue' : ''}`}
            >
              <div className="relative aspect-square">
                <div className="image-preview absolute inset-0">
                  <img src={img.preview} alt={`Preview of ${img.original.name}`} />
                </div>
                
                {img.isProcessing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-pulse-opacity text-white">Processing...</div>
                  </div>
                )}
              </div>
              
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-500 truncate" title={img.original.name}>
                    {img.original.name}
                  </div>
                  <Checkbox
                    checked={img.isSelected}
                    onCheckedChange={() => toggleSelectImage(index)}
                  />
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  {img.processed ? (
                    <div className="flex justify-between">
                      <span>Original: {(img.original.size / 1024).toFixed(1)} KB</span>
                      <span>New: {(img.processed.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ) : (
                    <span>Size: {(img.original.size / 1024).toFixed(1)} KB</span>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-1/2 mr-1"
                    onClick={() => processImage(index)}
                    disabled={img.isProcessing}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Process
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-1/2 ml-1"
                    onClick={() => downloadImage(index)}
                    disabled={!img.processed || img.isProcessing}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ImageIcon size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Images to Process</h3>
          <p className="text-gray-500 mb-4">
            Upload some images to get started
          </p>
          <Button onClick={onReset}>
            Upload Images
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;
