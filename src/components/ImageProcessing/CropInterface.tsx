
import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Crop, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";

interface CropInterfaceProps {
  imageUrl: string;
  aspectRatio?: number;
  onCropComplete: (croppedArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  onCancel: () => void;
}

const CropInterface: React.FC<CropInterfaceProps> = ({
  imageUrl,
  aspectRatio,
  onCropComplete,
  onCancel
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isDraggingRef = useRef(false);
  
  // State
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Load image on mount
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
      
      // Set initial crop area
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        // Scale image to fit container while maintaining aspect ratio
        const scale = Math.min(
          containerWidth / img.width,
          containerHeight / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center crop area
        const initialCropWidth = aspectRatio 
          ? Math.min(scaledWidth, scaledHeight * aspectRatio) 
          : scaledWidth * 0.8;
        
        const initialCropHeight = aspectRatio 
          ? initialCropWidth / aspectRatio 
          : scaledHeight * 0.8;
        
        setCropArea({
          x: (scaledWidth - initialCropWidth) / 2,
          y: (scaledHeight - initialCropHeight) / 2,
          width: initialCropWidth,
          height: initialCropHeight
        });
      }
    };
    img.src = imageUrl;
  }, [imageUrl, aspectRatio]);
  
  // Draw the crop interface on canvas
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match container
    if (containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image with zoom and pan
    const img = imageRef.current;
    
    // Calculate scaled dimensions
    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    ) * zoom;
    
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    // Center image in canvas
    const x = (canvas.width - scaledWidth) / 2 + dragOffset.x;
    const y = (canvas.height - scaledHeight) / 2 + dragOffset.y;
    
    // Draw image
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    
    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw crop area (clear rectangle)
    ctx.clearRect(
      cropArea.x + x,
      cropArea.y + y,
      cropArea.width,
      cropArea.height
    );
    
    // Draw crop area border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      cropArea.x + x,
      cropArea.y + y,
      cropArea.width,
      cropArea.height
    );
    
    // Draw rule-of-thirds grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 1; i <= 2; i++) {
      const lineX = cropArea.x + x + (cropArea.width * i) / 3;
      ctx.beginPath();
      ctx.moveTo(lineX, cropArea.y + y);
      ctx.lineTo(lineX, cropArea.y + y + cropArea.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 1; i <= 2; i++) {
      const lineY = cropArea.y + y + (cropArea.height * i) / 3;
      ctx.beginPath();
      ctx.moveTo(cropArea.x + x, lineY);
      ctx.lineTo(cropArea.x + x + cropArea.width, lineY);
      ctx.stroke();
    }
    
    // Draw handles
    const handleSize = 10;
    ctx.fillStyle = 'white';
    
    // Corner handles
    const corners = [
      { x: cropArea.x, y: cropArea.y }, // Top-left
      { x: cropArea.x + cropArea.width, y: cropArea.y }, // Top-right
      { x: cropArea.x, y: cropArea.y + cropArea.height }, // Bottom-left
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height }, // Bottom-right
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(
        corner.x + x - handleSize / 2,
        corner.y + y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
    
  }, [imageLoaded, cropArea, zoom, dragOffset, aspectRatio]);
  
  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    isDraggingRef.current = true;
    setDragStart({ x: mouseX, y: mouseY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const deltaX = mouseX - dragStart.x;
    const deltaY = mouseY - dragStart.y;
    
    setDragOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setDragStart({ x: mouseX, y: mouseY });
  };
  
  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };
  
  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Reset to original position
  const handleReset = () => {
    setZoom(1);
    setDragOffset({ x: 0, y: 0 });
  };
  
  // Complete crop
  const handleCompleteCrop = () => {
    if (!imageRef.current) return;
    
    // Calculate the real crop coordinates relative to the original image
    const img = imageRef.current;
    const canvas = canvasRef.current!;
    
    // Calculate scaled dimensions
    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    ) * zoom;
    
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    
    // Center image in canvas
    const x = (canvas.width - scaledWidth) / 2 + dragOffset.x;
    const y = (canvas.height - scaledHeight) / 2 + dragOffset.y;
    
    // Convert crop area coordinates to original image coordinates
    const originalCrop = {
      x: (cropArea.x - x) / scale,
      y: (cropArea.y - y) / scale,
      width: cropArea.width / scale,
      height: cropArea.height / scale
    };
    
    // Ensure crop area is within image bounds
    const boundedCrop = {
      x: Math.max(0, Math.min(originalCrop.x, img.width)),
      y: Math.max(0, Math.min(originalCrop.y, img.height)),
      width: Math.min(originalCrop.width, img.width - originalCrop.x),
      height: Math.min(originalCrop.height, img.height - originalCrop.y)
    };
    
    onCropComplete(boundedCrop);
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div 
            ref={containerRef}
            className="relative w-full h-[400px] border rounded-md overflow-hidden bg-gray-100"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p>Loading image...</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                title="Reset View"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteCrop}
              >
                <Crop className="h-4 w-4 mr-2" />
                Apply Crop
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom * 100]}
              min={50}
              max={300}
              step={5}
              onValueChange={([value]) => setZoom(value / 100)}
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center">
              <Move className="h-3 w-3 mr-1" />
              <span>Drag image to position crop area</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CropInterface;
