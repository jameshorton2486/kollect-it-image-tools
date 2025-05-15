
import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface ImageDropzoneProps {
  onImageUpload: (files: File[]) => void;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  maxFiles?: number;
}

const DEFAULT_MAX_FILE_SIZE = 10; // 10MB
const DEFAULT_ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageUpload,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_FILE_TYPES,
  maxFiles = 10
}) => {
  const [isDragging, setIsDragging] = useState(false);

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
      }
    }
  }, [onImageUpload, validateFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      const validatedFiles = validateFiles(fileArray);
      
      if (validatedFiles) {
        onImageUpload(validatedFiles);
      }
    }
    
    // Reset the input value so the same file can be uploaded again if needed
    e.target.value = '';
  }, [onImageUpload, validateFiles]);

  return (
    <div
      className={`drop-area ${isDragging ? 'active' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Upload size={48} className="text-brand-blue mb-4" />
      <h3 className="text-lg font-semibold mb-2">Drag & Drop Images Here</h3>
      <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
        Drop images here or click to browse. Supports JPG, PNG, WebP up to {maxFileSize}MB each (max {maxFiles} files).
      </p>
      
      <input
        type="file"
        accept={acceptedFileTypes.join(',')}
        multiple
        className="hidden"
        id="file-upload"
        onChange={handleFileInputChange}
      />
      
      <label htmlFor="file-upload">
        <Button variant="default" className="cursor-pointer">
          Select Files
        </Button>
      </label>
    </div>
  );
};

export default ImageDropzone;
