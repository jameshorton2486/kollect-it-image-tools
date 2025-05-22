
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Folder, Upload, FileUp } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BatchUploadSectionProps {
  onFilesUploaded: (files: File[]) => void;
  isProcessing: boolean;
}

const BatchUploadSection: React.FC<BatchUploadSectionProps> = ({ 
  onFilesUploaded, 
  isProcessing 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const uploadedFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      
      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles);
        toast({
          title: "Files Uploaded",
          description: `${uploadedFiles.length} images ready for processing`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Files",
          description: "Please upload image files only"
        });
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFiles = Array.from(e.target.files).filter(
        file => file.type.startsWith('image/')
      );
      
      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles);
        toast({
          title: "Files Uploaded",
          description: `${uploadedFiles.length} images ready for processing`
        });
      }
    }
  };

  const handleFolderClick = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-md">Batch Upload</CardTitle>
        <CardDescription>
          Add more images to the current batch
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 transition-colors text-center
            ${dragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50"}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Drag and drop images here</p>
              <p>or use the options below</p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFolderClick}
                disabled={isProcessing}
                className="flex gap-2"
              >
                <Folder className="h-4 w-4" />
                <span>Upload Folder</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleFileClick}
                disabled={isProcessing}
                className="flex gap-2"
              >
                <FileUp className="h-4 w-4" />
                <span>Select Files</span>
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <input
              ref={folderInputRef}
              type="file"
              multiple
              accept="image/*"
              webkitdirectory=""
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchUploadSection;
