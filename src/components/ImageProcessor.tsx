
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Trash2, Image } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

interface ProcessedImage {
  id: string;
  original: File;
  preview: string;
  processed: Blob | null;
  processedPreview: string;
  width: number;
  height: number;
  quality: number;
  removeBackground: boolean;
  isProcessing: boolean;
}

interface ImageProcessorProps {
  images: File[];
  onReset: () => void;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ images, onReset }) => {
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (images.length === 0) return;
    
    // Initialize processed images from uploads
    const newProcessedImages = images.map(file => {
      const id = `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id,
        original: file,
        preview: URL.createObjectURL(file),
        processed: null,
        processedPreview: '',
        width: 0,
        height: 0,
        quality: 80,
        removeBackground: false,
        isProcessing: false
      };
    });

    setProcessedImages(prevImages => [...prevImages, ...newProcessedImages]);
  }, [images]);

  // Get original image dimensions
  useEffect(() => {
    processedImages.forEach(image => {
      if (image.width === 0 || image.height === 0) {
        const img = new Image();
        img.onload = () => {
          setProcessedImages(prev => 
            prev.map(prevImage => 
              prevImage.id === image.id 
                ? { ...prevImage, width: img.naturalWidth, height: img.naturalHeight } 
                : prevImage
            )
          );
        };
        img.src = image.preview;
      }
    });
  }, [processedImages]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      processedImages.forEach(image => {
        URL.revokeObjectURL(image.preview);
        if (image.processedPreview) {
          URL.revokeObjectURL(image.processedPreview);
        }
      });
    };
  }, []);

  const processImage = useCallback(async (image: ProcessedImage) => {
    if (!image) return null;
    
    setProcessedImages(prev => 
      prev.map(img => 
        img.id === image.id 
          ? { ...img, isProcessing: true } 
          : img
      )
    );

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Load the image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image.preview;
      });

      // Set canvas dimensions
      canvas.width = image.width;
      canvas.height = image.height;

      // Draw the image to the canvas
      ctx.drawImage(img, 0, 0, image.width, image.height);

      // Convert to blob with the specified quality
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (result) => {
            resolve(result as Blob);
          },
          'image/jpeg', 
          image.quality / 100
        );
      });

      // Update the processed image in state
      const processedPreview = URL.createObjectURL(blob);

      setProcessedImages(prev => 
        prev.map(img => 
          img.id === image.id 
            ? { 
                ...img, 
                processed: blob, 
                processedPreview, 
                isProcessing: false 
              } 
            : img
        )
      );

      return blob;
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error(`Failed to process ${image.original.name}`);
      
      setProcessedImages(prev => 
        prev.map(img => 
          img.id === image.id 
            ? { ...img, isProcessing: false } 
            : img
        )
      );
      return null;
    }
  }, []);

  const handleProcessAll = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const promises = processedImages.map(image => processImage(image));
      await Promise.all(promises);
      toast.success('All images processed successfully!');
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process some images');
    } finally {
      setIsProcessing(false);
    }
  }, [processedImages, processImage]);

  const handleUpdateImageSettings = useCallback((id: string, updates: Partial<ProcessedImage>) => {
    setProcessedImages(prev => 
      prev.map(img => 
        img.id === id 
          ? { ...img, ...updates } 
          : img
      )
    );
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setProcessedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      
      // Revoke object URLs to prevent memory leaks
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
        if (imageToRemove.processedPreview) {
          URL.revokeObjectURL(imageToRemove.processedPreview);
        }
      }
      
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleDownloadImage = useCallback((image: ProcessedImage) => {
    if (!image.processed) {
      // If not processed yet, process it first
      processImage(image).then(blob => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `optimized-${image.original.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
      return;
    }
    
    // Download already processed image
    const link = document.createElement('a');
    link.href = URL.createObjectURL(image.processed);
    link.download = `optimized-${image.original.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processImage]);

  const handleDownloadAll = useCallback(async () => {
    // Process any unprocessed images first
    const unprocessedImages = processedImages.filter(img => !img.processed);
    if (unprocessedImages.length > 0) {
      setIsProcessing(true);
      await Promise.all(unprocessedImages.map(img => processImage(img)));
      setIsProcessing(false);
    }
    
    // If there are multiple images, create a zip file
    if (processedImages.length > 1) {
      toast.info('Preparing zip file for download...');
      // For a real implementation, we'd use JSZip here
      // But for simplicity, we'll just download them individually for now
      processedImages.forEach(img => {
        if (img.processed) {
          setTimeout(() => {
            handleDownloadImage(img);
          }, 200); // Slight delay between downloads
        }
      });
      return;
    }
    
    // If there's just one image, download it directly
    if (processedImages.length === 1 && processedImages[0].processed) {
      handleDownloadImage(processedImages[0]);
    }
  }, [processedImages, handleDownloadImage, processImage]);

  const handleReset = useCallback(() => {
    // Clean up any object URLs
    processedImages.forEach(image => {
      URL.revokeObjectURL(image.preview);
      if (image.processedPreview) {
        URL.revokeObjectURL(image.processedPreview);
      }
    });
    
    setProcessedImages([]);
    onReset();
  }, [processedImages, onReset]);

  const filteredImages = useCallback(() => {
    if (activeTab === 'all') return processedImages;
    if (activeTab === 'processed') return processedImages.filter(img => img.processed);
    if (activeTab === 'unprocessed') return processedImages.filter(img => !img.processed);
    return processedImages;
  }, [processedImages, activeTab]);

  if (processedImages.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-2xl font-bold">Image Processor</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            variant="default" 
            onClick={handleProcessAll}
            disabled={isProcessing || processedImages.length === 0}
          >
            {isProcessing ? 'Processing...' : 'Process All'}
          </Button>
          <Button 
            variant="default" 
            onClick={handleDownloadAll}
            disabled={isProcessing || processedImages.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Images ({processedImages.length})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({processedImages.filter(img => img.processed).length})</TabsTrigger>
          <TabsTrigger value="unprocessed">Unprocessed ({processedImages.filter(img => !img.processed).length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages().map(image => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  <div className="flex space-x-4">
                    <div className="image-preview">
                      <img src={image.preview} alt="Original" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                        Original
                      </div>
                    </div>
                    
                    <div className="image-preview">
                      {image.isProcessing ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-pulse-opacity">
                            <Image size={48} className="text-gray-400" />
                          </div>
                        </div>
                      ) : image.processedPreview ? (
                        <>
                          <img src={image.processedPreview} alt="Processed" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                            Processed
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-gray-400">
                            <Image size={48} />
                            <p className="text-xs mt-2">Not processed</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">{image.original.name}</span>
                      <div className="text-xs text-gray-500">
                        {image.width}x{image.height} · {(image.original.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`quality-${image.id}`}>Quality: {image.quality}%</Label>
                      </div>
                      <Slider
                        id={`quality-${image.id}`}
                        min={10}
                        max={100}
                        step={1}
                        value={[image.quality]}
                        onValueChange={(value) => handleUpdateImageSettings(image.id, { quality: value[0] })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor={`width-${image.id}`}>Width</Label>
                        <Input
                          id={`width-${image.id}`}
                          type="number"
                          value={image.width}
                          onChange={(e) => handleUpdateImageSettings(image.id, { width: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`height-${image.id}`}>Height</Label>
                        <Input
                          id={`height-${image.id}`}
                          type="number"
                          value={image.height}
                          onChange={(e) => handleUpdateImageSettings(image.id, { height: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`bg-remove-${image.id}`}
                        checked={image.removeBackground}
                        onCheckedChange={(checked) => {
                          toast.info("Background removal is a premium feature coming soon!");
                          handleUpdateImageSettings(image.id, { removeBackground: checked });
                        }}
                      />
                      <Label htmlFor={`bg-remove-${image.id}`}>Remove background (coming soon)</Label>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => processImage(image)}
                        disabled={image.isProcessing}
                      >
                        {image.isProcessing ? 'Processing...' : 'Process'}
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownloadImage(image)}
                        disabled={!image.processed && !image.isProcessing}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="processed" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages().map(image => (
              <Card key={image.id} className="overflow-hidden">
                {/* Same content as above */}
                <CardContent className="p-4 space-y-4">
                  {/* Duplicate the card content from above for each tab */}
                  <div className="flex space-x-4">
                    <div className="image-preview">
                      <img src={image.preview} alt="Original" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                        Original
                      </div>
                    </div>
                    
                    <div className="image-preview">
                      {image.isProcessing ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-pulse-opacity">
                            <Image size={48} className="text-gray-400" />
                          </div>
                        </div>
                      ) : image.processedPreview ? (
                        <>
                          <img src={image.processedPreview} alt="Processed" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                            Processed
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-gray-400">
                            <Image size={48} />
                            <p className="text-xs mt-2">Not processed</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Rest of card content */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">{image.original.name}</span>
                      <div className="text-xs text-gray-500">
                        {image.width}x{image.height} · {(image.original.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`quality-${image.id}-processed`}>Quality: {image.quality}%</Label>
                      </div>
                      <Slider
                        id={`quality-${image.id}-processed`}
                        min={10}
                        max={100}
                        step={1}
                        value={[image.quality]}
                        onValueChange={(value) => handleUpdateImageSettings(image.id, { quality: value[0] })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor={`width-${image.id}-processed`}>Width</Label>
                        <Input
                          id={`width-${image.id}-processed`}
                          type="number"
                          value={image.width}
                          onChange={(e) => handleUpdateImageSettings(image.id, { width: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`height-${image.id}-processed`}>Height</Label>
                        <Input
                          id={`height-${image.id}-processed`}
                          type="number"
                          value={image.height}
                          onChange={(e) => handleUpdateImageSettings(image.id, { height: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`bg-remove-${image.id}-processed`}
                        checked={image.removeBackground}
                        onCheckedChange={(checked) => {
                          toast.info("Background removal is a premium feature coming soon!");
                          handleUpdateImageSettings(image.id, { removeBackground: checked });
                        }}
                      />
                      <Label htmlFor={`bg-remove-${image.id}-processed`}>Remove background (coming soon)</Label>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => processImage(image)}
                        disabled={image.isProcessing}
                      >
                        {image.isProcessing ? 'Processing...' : 'Process'}
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownloadImage(image)}
                        disabled={!image.processed && !image.isProcessing}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="unprocessed" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages().map(image => (
              <Card key={image.id} className="overflow-hidden">
                {/* Same content as above */}
                <CardContent className="p-4 space-y-4">
                  {/* Duplicate the card content from above for each tab */}
                  <div className="flex space-x-4">
                    <div className="image-preview">
                      <img src={image.preview} alt="Original" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                        Original
                      </div>
                    </div>
                    
                    <div className="image-preview">
                      {image.isProcessing ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-pulse-opacity">
                            <Image size={48} className="text-gray-400" />
                          </div>
                        </div>
                      ) : image.processedPreview ? (
                        <>
                          <img src={image.processedPreview} alt="Processed" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-1 px-2">
                            Processed
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-gray-400">
                            <Image size={48} />
                            <p className="text-xs mt-2">Not processed</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Rest of card content */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">{image.original.name}</span>
                      <div className="text-xs text-gray-500">
                        {image.width}x{image.height} · {(image.original.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`quality-${image.id}-unprocessed`}>Quality: {image.quality}%</Label>
                      </div>
                      <Slider
                        id={`quality-${image.id}-unprocessed`}
                        min={10}
                        max={100}
                        step={1}
                        value={[image.quality]}
                        onValueChange={(value) => handleUpdateImageSettings(image.id, { quality: value[0] })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor={`width-${image.id}-unprocessed`}>Width</Label>
                        <Input
                          id={`width-${image.id}-unprocessed`}
                          type="number"
                          value={image.width}
                          onChange={(e) => handleUpdateImageSettings(image.id, { width: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`height-${image.id}-unprocessed`}>Height</Label>
                        <Input
                          id={`height-${image.id}-unprocessed`}
                          type="number"
                          value={image.height}
                          onChange={(e) => handleUpdateImageSettings(image.id, { height: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`bg-remove-${image.id}-unprocessed`}
                        checked={image.removeBackground}
                        onCheckedChange={(checked) => {
                          toast.info("Background removal is a premium feature coming soon!");
                          handleUpdateImageSettings(image.id, { removeBackground: checked });
                        }}
                      />
                      <Label htmlFor={`bg-remove-${image.id}-unprocessed`}>Remove background (coming soon)</Label>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => processImage(image)}
                        disabled={image.isProcessing}
                      >
                        {image.isProcessing ? 'Processing...' : 'Process'}
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownloadImage(image)}
                        disabled={!image.processed && !image.isProcessing}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageProcessor;
