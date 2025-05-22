
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitBranch, RefreshCw } from "lucide-react";
import { toast } from 'sonner';

interface GitHubConnectorProps {
  defaultRepo?: string;
  onImagesLoaded: (files: File[]) => void;
}

const GitHubConnector: React.FC<GitHubConnectorProps> = ({ 
  defaultRepo = "jameshorton2486/kollect-it-image-tools",
  onImagesLoaded 
}) => {
  const [repoUrl, setRepoUrl] = useState(`https://github.com/${defaultRepo}.git`);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConnect = async () => {
    setIsLoading(true);
    
    try {
      // This is a mock implementation - in a real app, this would connect to GitHub
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock loading some images from the repository
      // In a real app, this would fetch actual image files from GitHub
      const mockFiles = Array(5).fill(null).map((_, index) => {
        // Create a simple canvas as a placeholder for real images
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = `hsl(${index * 50}, 70%, 70%)`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.fillText(`GitHub Image ${index + 1}`, 100, 150);
        }
        
        // Convert canvas to blob and create a File
        const blob = new Blob([canvas.toDataURL('image/png')], { type: 'image/png' });
        return new File([blob], `github-image-${index + 1}.png`, { type: 'image/png' });
      });
      
      onImagesLoaded(mockFiles);
      toast.success(`Successfully loaded ${mockFiles.length} images from GitHub repository`);
    } catch (error) {
      toast.error(`Failed to connect to GitHub repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('GitHub connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch size={18} />
          GitHub Repository Connection
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Enter GitHub repository URL"
            className="w-full"
          />
          
          <Button 
            onClick={handleConnect} 
            disabled={isLoading || !repoUrl.trim()}
            className="w-full"
          >
            {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {isLoading ? 'Connecting...' : 'Connect to Repository'}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Connect to the Kollect-It image tools repository to import product images directly from GitHub.
        </p>
      </CardContent>
    </Card>
  );
};

export default GitHubConnector;
