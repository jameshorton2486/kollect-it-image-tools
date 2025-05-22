
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, FileImage, Settings } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { WORDPRESS_IMAGE_TYPES, WordPressImageType } from '@/types/wordpressImageTypes';
import { ProcessedImage } from '@/types/imageProcessing';

interface WordPressImageOptionsProps {
  processedImages: ProcessedImage[];
  onApplyWordPressType: (imageIndex: number, typeId: string) => void;
  onApplyBulkWordPressType: (typeId: string) => void;
  onRenameImage: (imageIndex: number, newName: string) => void;
  onSetOutputFormat: (imageIndex: number, format: string) => void;
  onSetExportPath: (path: string) => void;
  exportPath: string;
}

const getFormatBadgeColor = (format: string) => {
  switch(format.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'bg-blue-500';
    case '.png':
      return 'bg-green-500';
    case '.webp':
      return 'bg-purple-500';
    case '.svg':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

const WordPressImageOptions: React.FC<WordPressImageOptionsProps> = ({
  processedImages,
  onApplyWordPressType,
  onApplyBulkWordPressType,
  onRenameImage,
  onSetOutputFormat,
  onSetExportPath,
  exportPath
}) => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);
  
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    onApplyBulkWordPressType(value);
  };
  
  // Find the currently selected WordPress type
  const selectedWordPressType = WORDPRESS_IMAGE_TYPES.find(type => type.id === selectedType);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>WordPress Image Options</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Apply WordPress image specifications to selected images</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* WordPress Image Type Selector */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Image Type</label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select WordPress image type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>WordPress Image Types</SelectLabel>
                  {WORDPRESS_IMAGE_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.recommendedSize})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Type details */}
          {showDetails && selectedWordPressType && (
            <div className="border rounded p-3 space-y-2 bg-muted/20">
              <h4 className="font-medium">{selectedWordPressType.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedWordPressType.purpose}</p>
              <div className="space-y-1">
                <span className="text-xs font-medium">Recommended Size:</span>
                <span className="text-xs block">{selectedWordPressType.recommendedSize}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium">Format:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedWordPressType.format.map((format) => (
                    <Badge key={format} variant="secondary">{format}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium">Tips:</span>
                <ul className="text-xs list-disc pl-4">
                  {selectedWordPressType.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Export path */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Export Location</label>
            <div className="flex gap-2">
              <Input 
                value={exportPath} 
                onChange={(e) => onSetExportPath(e.target.value)} 
                placeholder="Export folder path" 
              />
              <Button
                variant="outline"
                onClick={() => {
                  // In a browser environment, we can't directly access the file system
                  // This would need to be implemented with a native file dialog
                  // For now, we'll just alert the user
                  alert("In a real app, this would open a folder selector dialog");
                }}
              >
                Browse
              </Button>
            </div>
          </div>
          
          {/* File formats */}
          <div>
            <label className="text-sm font-medium">Supported Formats</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedWordPressType && selectedWordPressType.format.map((format) => (
                <Badge key={format} className={getFormatBadgeColor(format)}>
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordPressImageOptions;
