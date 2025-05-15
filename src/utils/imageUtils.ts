
import imageCompression from 'browser-image-compression';
import { toast } from '@/components/ui/use-toast';

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
    toast({
      variant: "destructive",
      title: "Compression Failed",
      description: `Failed to compress ${file.name}`
    });
    return null;
  }
}

export function createObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export function downloadFile(file: File, filename: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
