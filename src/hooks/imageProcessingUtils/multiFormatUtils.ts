
import { toast } from 'sonner';
import { ProcessedImage } from '@/types/imageProcessing';
import { downloadFile } from '@/utils/imageUtils';

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
  downloadFile(formatFile, `${formatFile.name}`);
  
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
    downloadFile(file, `${file.name}`);
  });
  
  toast.success(`Downloaded ${formats.length} format${formats.length !== 1 ? 's' : ''}`);
}
