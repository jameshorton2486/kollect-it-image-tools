
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Folder, GitBranch, RefreshCw, Upload } from "lucide-react";
import { toast } from 'sonner';
import { RAW_UPLOADS_PATH } from '@/utils/googleDriveUtils';
import GitHubConnector from './GitHubConnector';

interface DirectorySourceSectionProps {
  onImagesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const DEFAULT_REPO_URL = "https://github.com/jameshorton2486/kollect-it-image-tools.git";

const DirectorySourceSection: React.FC<DirectorySourceSectionProps> = ({ 
  onImagesSelected,
  isProcessing
}) => {
  const [localPath, setLocalPath] = useState(RAW_UPLOADS_PATH);
  const [useGitRepo, setUseGitRepo] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  
  // In a real application, this would interact with a backend or Electron API
  // to access the file system or GitHub repository
  const browseFolderOrRepo = async () => {
    setIsLoadingImages(true);
    try {
      // Simulate loading images - in a real app, this would connect to GitHub or local filesystem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate found images
      const mockImages = [
        'product1.jpg',
        'product2.png',
        'product3.webp',
        'banner_image.jpg',
        'logo_transparent.png'
      ];
      
      setAvailableImages(mockImages);
      toast.success(`Found ${mockImages.length} images in ${useGitRepo ? 'repository' : 'folder'}`);
    } catch (error) {
      toast.error(`Error loading images: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Error browsing for images:", error);
    } finally {
      setIsLoadingImages(false);
    }
  };
  
  // Mock function to simulate loading images as Files
  // In a real app, this would fetch actual files from GitHub or load from disk
  const handleLoadSelectedImages = async () => {
    if (availableImages.length === 0) {
      toast.error("No images available to load");
      return;
    }
    
    setIsLoadingImages(true);
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create dummy File objects (in real app, these would be actual files)
      const files: File[] = availableImages.map((imageName, index) => {
        // Create a dummy canvas to generate a blob
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
          ctx.fillRect(0, 0, 300, 200);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.fillText(imageName, 50, 100);
        }
        
        // Convert canvas to blob and create a File
        return new File(
          [new Blob([canvas.toDataURL()], { type: 'image/png' })], 
          imageName, 
          { type: imageName.endsWith('.png') ? 'image/png' : 'image/jpeg' }
        );
      });
      
      // Add source information to track where these images came from
      const sourceFiles = files.map(file => {
        const fileWithSource = new File([file], file.name, { type: file.type });
        Object.defineProperty(fileWithSource, 'source', {
          value: {
            path: useGitRepo ? 'github-repo' : localPath,
            repository: useGitRepo ? DEFAULT_REPO_URL : undefined,
          },
          writable: true
        });
        return fileWithSource;
      });
      
      onImagesSelected(sourceFiles);
      toast.success(`Loaded ${sourceFiles.length} images from ${useGitRepo ? 'GitHub' : 'local folder'}`);
    } catch (error) {
      toast.error(`Error loading images: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("Error loading selected images:", error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    // Reset available images when switching between repo and local folder
    setAvailableImages([]);
  }, [useGitRepo]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {useGitRepo ? <GitBranch size={18} /> : <Folder size={18} />}
          {useGitRepo ? 'GitHub Repository Source' : 'Local Directory Source'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-git-repo"
            checked={useGitRepo}
            onCheckedChange={setUseGitRepo}
            disabled={isProcessing || isLoadingImages}
          />
          <Label htmlFor="use-git-repo">Use GitHub repository</Label>
        </div>
        
        {useGitRepo ? (
          <GitHubConnector 
            defaultRepo="jameshorton2486/kollect-it-image-tools" 
            onImagesLoaded={onImagesSelected}
          />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="source-path">Local Directory Path</Label>
            <div className="flex gap-2">
              <Input 
                id="source-path"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="C:\\Path\\To\\Images"
                disabled={isProcessing || isLoadingImages}
                className="flex-grow"
              />
              <Button 
                onClick={browseFolderOrRepo}
                disabled={isProcessing || isLoadingImages}
                variant="outline"
              >
                {isLoadingImages ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <Folder size={16} className="mr-2" />}
                Browse
              </Button>
            </div>
          </div>
        )}
        
        {!useGitRepo && availableImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Available Images ({availableImages.length})</Label>
              <Button 
                size="sm" 
                onClick={handleLoadSelectedImages}
                disabled={isProcessing || isLoadingImages}
              >
                {isLoadingImages ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-2" />}
                Load Images
              </Button>
            </div>
            
            <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
              <ul className="space-y-1">
                {availableImages.map((img, idx) => (
                  <li key={idx} className="text-sm p-1 hover:bg-gray-100 rounded flex items-center">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                    {img}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          {useGitRepo 
            ? "Connect to a GitHub repository to browse and import product images."
            : "Browse your local directory to find product images to import."}
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectorySourceSection;
