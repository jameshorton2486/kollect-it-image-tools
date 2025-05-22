
import React, { useCallback, useState } from 'react';
import { Upload, Folder, Image as ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface ImageDropzoneProps {
  onImageUpload: (files: File[]) => void;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  maxFiles?: number;
  title?: string;
  description?: string;
}

const DEFAULT_MAX_FILE_SIZE = 10; // 10MB
const DEFAULT_ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageUpload,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_FILE_TYPES,
  maxFiles = 10,
  title = "Drag & Drop Images Here",
  description = "Drop images here or click to browse. Supports JPG, PNG, WebP up to 10MB each (max 10 files)."
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const validateFiles = useCallback((files: File[]) => {
    if (files.length > maxFiles) {
      toast.error(`You can only upload a maximum of ${maxFiles} files at once.`);
      return false;
    }

    let allValid = true;
    
    const validatedFiles = files.filter(file => {
      // Check file type
      if (!acceptedFileTypes.includes(file.type)) {
        toast.error(`File type not supported: ${file.name}`);
        allValid = false;
        return false;
      }
      
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max ${maxFileSize}MB)`);
        allValid = false;
        return false;
      }
      
      return true;
    });

    return allValid ? validatedFiles : false;
  }, [acceptedFileTypes, maxFileSize, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      const validatedFiles = validateFiles(fileArray);
      
      if (validatedFiles) {
        onImageUpload(validatedFiles);
        // Add toast notification for successful upload
        toast.success(`Successfully added ${validatedFiles.length} image${validatedFiles.length !== 1 ? 's' : ''}`);
      }
    }
  }, [onImageUpload, validateFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      const validatedFiles = validateFiles(fileArray);
      
      if (validatedFiles) {
        onImageUpload(validatedFiles);
        // Add toast notification for successful upload
        toast.success(`Successfully added ${validatedFiles.length} image${validatedFiles.length !== 1 ? 's' : ''}`);
      }
    }
    
    // Reset the input value so the same file can be uploaded again if needed
    if (e.target) {
      e.target.value = '';
    }
  }, [onImageUpload, validateFiles]);
  
  const handleFolderSelect = useCallback(() => {
    // Programmatically click the folder input
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  }, []);
  
  const handleSelectButtonClick = useCallback(() => {
    // Programmatically click the file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Create a descriptive format string based on accepted types
  const getFormatDescription = () => {
    const formats = [];
    if (acceptedFileTypes.includes('image/jpeg')) formats.push('JPG');
    if (acceptedFileTypes.includes('image/png')) formats.push('PNG');
    if (acceptedFileTypes.includes('image/webp')) formats.push('WebP');
    if (acceptedFileTypes.includes('image/gif')) formats.push('GIF');
    
    return formats.join(', ');
  };

  return (
    <div
      className={`drop-area border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Upload size={48} className="text-brand-blue mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
        {description || `Drop images here or click to browse. Supports ${getFormatDescription()} up to ${maxFileSize}MB each (max ${maxFiles} files).`}
      </p>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          className="cursor-pointer flex items-center gap-2"
          onClick={handleFolderSelect}
        >
          <Folder size={16} />
          Select Folder
        </Button>
        
        <Button 
          variant="default" 
          className="cursor-pointer flex items-center gap-2"
          onClick={handleSelectButtonClick}
        >
          <ImageIcon size={16} />
          Select Files
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes.join(',')}
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      
      <input
        ref={folderInputRef}
        type="file"
        accept={acceptedFileTypes.join(',')}
        multiple
        className="hidden"
        {...{ webkitdirectory: "", directory: "" } as any}
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default ImageDropzone;
