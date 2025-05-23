
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Upload, 
  Server, 
  Key, 
  Tag, 
  ShoppingBag, 
  CheckCircle
} from "lucide-react";
import { ProcessedImage } from "@/types/imageProcessing";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';

// Updated interface for upload options
interface KollectItUploadOptions {
  apiKey: string;
  uploadUrl: string;
  productId?: string;
  productTitle?: string;
  tags?: string[];
  categories?: string[];
}

interface KollectItIntegrationSectionProps {
  processedImages: ProcessedImage[];
  apiKey: string | null;
  uploadUrl: string;
  onApiKeyChange: (value: string) => void;
  onUploadUrlChange: (value: string) => void;
}

// Mock implementation of uploadToKollectIt functions for TypeScript compatibility
const uploadToKollectIt = async (file: File, options: KollectItUploadOptions): Promise<{success: boolean}> => {
  // Implementation would go here in a real app
  return { success: true };
};

const batchUploadToKollectIt = async (
  files: File[], 
  options: KollectItUploadOptions,
  onProgress?: (progress: number) => void
): Promise<{successCount: number, failureCount: number}> => {
  // Implementation would go here in a real app
  if (onProgress) {
    onProgress(100);
  }
  return { successCount: files.length, failureCount: 0 };
};

const KollectItIntegrationSection: React.FC<KollectItIntegrationSectionProps> = ({
  processedImages,
  apiKey,
  uploadUrl,
  onApiKeyChange,
  onUploadUrlChange
}) => {
  const [isShowingAdvanced, setIsShowingAdvanced] = useState(false);
  const [productId, setProductId] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Count how many processed images we have
  const processedCount = processedImages.filter(img => 
    img.processed && img.isSelected
  ).length;
  
  const hasValidConfig = apiKey && uploadUrl;
  
  const handleUpload = async () => {
    if (!hasValidConfig || isUploading) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setShowSuccessMessage(false);
    
    try {
      const imagesToUpload = processedImages
        .filter(img => img.processed && img.isSelected)
        .map(img => {
          // Safely convert processed Blob to File by creating a new File instance
          if (img.processed instanceof Blob) {
            return new File([img.processed], img.original.name, { type: img.processed.type });
          }
          return img.original; // Fallback to original if processed isn't available
        });
      
      if (imagesToUpload.length === 0) {
        toast.error("No Images to Upload");
        return;
      }
      
      const options: KollectItUploadOptions = {
        apiKey: apiKey!,
        uploadUrl,
        productId: productId || undefined,
        productTitle: productTitle || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
        categories: categories ? categories.split(',').map(c => c.trim()) : undefined
      };
      
      const result = await batchUploadToKollectIt(
        imagesToUpload, 
        options,
        setUploadProgress
      );
      
      if (result.successCount > 0) {
        toast.success(`Successfully uploaded ${result.successCount} images to Kollect-It`);
        
        setShowSuccessMessage(true);
        
        // Reset after successful upload
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      }
      
      if (result.failureCount > 0) {
        toast.error(`Failed to upload ${result.failureCount} images`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <h3 className="font-medium">Kollect-It Integration</h3>
        </div>
        
        {hasValidConfig && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600">Connected</span>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <Label className="text-sm">API Key</Label>
          </div>
          <Input
            type="password"
            placeholder="Enter your Kollect-It API key"
            value={apiKey || ''}
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <Label className="text-sm">Upload URL</Label>
          </div>
          <Input
            placeholder="https://api.kollect-it.com/upload"
            value={uploadUrl}
            onChange={(e) => onUploadUrlChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="advanced-mode"
            checked={isShowingAdvanced}
            onCheckedChange={setIsShowingAdvanced}
          />
          <Label htmlFor="advanced-mode" className="text-sm">Show advanced options</Label>
        </div>
        
        {isShowingAdvanced && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                <Label className="text-xs">Product ID</Label>
              </div>
              <Input
                placeholder="Optional product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="text-sm h-8"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                <Label className="text-xs">Product Title</Label>
              </div>
              <Input
                placeholder="Optional product title"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                className="text-sm h-8"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <Label className="text-xs">Tags (comma separated)</Label>
              </div>
              <Input
                placeholder="e.g., product, optimized, high-quality"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="text-sm h-8"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <Label className="text-xs">Categories (comma separated)</Label>
              </div>
              <Input
                placeholder="e.g., apparel, electronics"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                className="text-sm h-8"
              />
            </div>
          </div>
        )}
      </div>
      
      {isUploading && (
        <div className="space-y-1">
          <Label className="text-xs">Uploading</Label>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-right">{Math.round(uploadProgress)}%</p>
        </div>
      )}
      
      {showSuccessMessage && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded-md">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Images uploaded successfully!</span>
        </div>
      )}
      
      <Button
        onClick={handleUpload}
        disabled={!hasValidConfig || isUploading || processedCount === 0}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? (
          <span>Uploading... ({Math.round(uploadProgress)}%)</span>
        ) : (
          <span>Upload {processedCount > 0 ? `${processedCount} Images` : 'Images'}</span>
        )}
      </Button>
    </Card>
  );
};

export default KollectItIntegrationSection;
