
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WORDPRESS_IMAGE_TYPES } from '@/types/wordpressImageTypes';

interface ImageRenameDialogProps {
  fileName: string;
  onRename: (newName: string) => void;
  onSetFormat: (format: string) => void;
  selectedWordPressType?: string;
  onSetWordPressType: (typeId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageRenameDialog: React.FC<ImageRenameDialogProps> = ({
  fileName,
  onRename,
  onSetFormat,
  selectedWordPressType,
  onSetWordPressType,
  open,
  onOpenChange,
}) => {
  const [newName, setNewName] = useState("");
  const [extension, setExtension] = useState("");
  
  // Find current WordPress image type
  const currentType = WORDPRESS_IMAGE_TYPES.find(type => type.id === selectedWordPressType);
  
  useEffect(() => {
    // Extract name without extension
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex > 0) {
      setNewName(fileName.substring(0, lastDotIndex));
      setExtension(fileName.substring(lastDotIndex));
    } else {
      setNewName(fileName);
      setExtension("");
    }
  }, [fileName, open]);
  
  const handleSubmit = () => {
    onRename(newName);
    if (extension) {
      onSetFormat(extension);
    }
    onOpenChange(false);
  };
  
  const handleFormatChange = (format: string) => {
    setExtension(format);
    onSetFormat(format);
  };
  
  // Get available formats based on the selected WordPress type
  const availableFormats = currentType?.format || ['.jpg', '.png', '.webp'];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Image</DialogTitle>
          <DialogDescription>
            Change the filename and format for this image
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filename" className="text-right">
              Filename
            </Label>
            <Input
              id="filename"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="col-span-3"
              autoComplete="off"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="format" className="text-right">
              Format
            </Label>
            <Select value={extension} onValueChange={handleFormatChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {availableFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={selectedWordPressType || ''} onValueChange={onSetWordPressType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="WordPress image type" />
              </SelectTrigger>
              <SelectContent>
                {WORDPRESS_IMAGE_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageRenameDialog;
