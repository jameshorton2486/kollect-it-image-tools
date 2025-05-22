
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Folder, Upload, FileUp, Check } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BatchUploadSectionProps {
  onFilesUploaded: (files: File[]) => void;
  isProcessing: boolean;
}

const BatchUploadSection: React.FC<BatchUploadSectionProps> = ({ 
  onFilesUploaded, 
  isProcessing 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [filesReady, setFilesReady] = useState(false);
  const [fileCount, setFileCount] = useState(0);
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
        setFileCount(uploadedFiles.length);
        setFilesReady(true);
        onFilesUploaded(uploadedFiles);
        toast({
          title: "Images Uploaded",
          description: `${uploadedFiles.length} ${uploadedFiles.length === 1 ? 'image' : 'images'} ready for processing`,
          variant: "default"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Files",
          description: "Please upload image files only (JPEG, PNG, etc.)"
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
        setFileCount(uploadedFiles.length);
        setFilesReady(true);
        onFilesUploaded(uploadedFiles);
        toast({
          title: "Images Uploaded",
          description: `${uploadedFiles.length} ${uploadedFiles.length === 1 ? 'image' : 'images'} ready for processing`,
          variant: "default"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Files",
          description: "Please upload image files only (JPEG, PNG, etc.)"
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
  
  const resetSelection = () => {
    setFilesReady(false);
    setFileCount(0);
    // We don't reset the actual files since they're already added to the main UI
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Add More Images</h3>
        {filesReady && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetSelection}
            disabled={isProcessing}
          >
            Reset
          </Button>
        )}
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-colors text-center
          ${dragActive ? "border-primary bg-primary/10" : filesReady ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-primary/50"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {filesReady ? (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-700">{fileCount} {fileCount === 1 ? 'image' : 'images'} ready</p>
                <p className="text-sm text-muted-foreground mt-1">Images will be added to your current batch</p>
              </div>
              <div className="w-full max-w-xs">
                <Progress value={100} className="h-1 bg-gray-200" />
              </div>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm text-center">
                <p className="font-medium">Drag and drop images here</p>
                <p className="text-muted-foreground">or use the options below</p>
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
            </>
          )}
          
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
            onChange={handleFileUpload}
            className="hidden"
            {...{ webkitdirectory: "", directory: "" } as any}
          />
        </div>
      </div>
      
      {!filesReady && (
        <div className="text-sm text-muted-foreground text-center mt-2">
          Supported formats: JPEG, PNG, WebP, GIF
        </div>
      )}
    </div>
  );
};

export default BatchUploadSection;
