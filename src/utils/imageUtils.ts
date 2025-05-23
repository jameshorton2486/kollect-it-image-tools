
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  initialQuality: number;
}

export async function compressImage(file: File, options: CompressionOptions): Promise<File | null> {
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    toast.error(`Failed to compress ${file.name}`);
    return null;
  }
}

export function createObjectUrl(file: File | Blob): string {
  return URL.createObjectURL(file);
}

export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export function downloadFile(file: File | Blob, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

export function replaceFileExtension(filename: string, newExtension: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return `${filename}.${newExtension}`;
  
  return filename.slice(0, lastDotIndex) + '.' + newExtension;
}

export function generateSeoFilename(originalName: string, width: number, height?: number, format?: string): string {
  // Remove the extension from the original name
  const nameWithoutExtension = originalName.slice(0, (originalName.lastIndexOf('.') - 1 >>> 0) + 1);
  
  // Clean the name (remove special characters, spaces to dashes)
  const cleanName = nameWithoutExtension
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  
  // Build the new filename
  let newName = cleanName;
  
  // Add dimensions
  if (height) {
    newName += `-${width}x${height}`;
  } else {
    newName += `-${width}`;
  }
  
  // Add format extension
  if (format) {
    newName += `.${format.toLowerCase()}`;
  } else {
    // Get the original extension
    const ext = getFileExtension(originalName);
    newName += `.${ext}`;
  }
  
  return newName;
}
