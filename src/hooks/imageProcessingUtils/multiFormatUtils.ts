
import { toast } from 'sonner';
import { ProcessedImage, ProcessedFormat } from '@/types/imageProcessing';

/**
 * Helper function to download a file
 */
const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download a specific format of a processed image
 */
export function downloadFormatUtil(index: number, format: string, processedImages: ProcessedImage[]): void {
  const image = processedImages[index];
  if (!image || !image.processedFormats || !image.processedFormats[format]) {
    toast.error(`${format.toUpperCase()} version not available`);
    return;
  }
  
  const formatFile = image.processedFormats[format];
  const fileName = formatFile.name || `image-${index}-${format}.${format}`;
  downloadBlob(formatFile.blob, fileName);
  
  toast.success(`Downloaded ${format.toUpperCase()} version`);
}

/**
 * Download all available formats of a processed image
 */
export function downloadAllFormatsUtil(index: number, processedImages: ProcessedImage[]): void {
  const image = processedImages[index];
  if (!image || !image.processedFormats) {
    toast.error('No processed formats available');
    return;
  }
  
  const formats = Object.entries(image.processedFormats);
  if (formats.length === 0) {
    toast.error('No processed formats available');
    return;
  }
  
  formats.forEach(([format, file]) => {
    const fileName = file.name || `image-${index}-${format}.${format}`;
    downloadBlob(file.blob, fileName);
  });
  
  toast.success(`Downloaded ${formats.length} format${formats.length !== 1 ? 's' : ''}`);
}
