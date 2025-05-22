
import { toast } from '@/hooks/use-toast';
import { ProcessedImage } from "@/types/imageProcessing";
import { trackEvent } from '@/utils/analyticsUtils';
import { logger } from '@/utils/logging';
import JSZip from 'jszip';

export function downloadFormatUtil(
  index: number,
  format: string,
  processedImages: ProcessedImage[]
): void {
  const image = processedImages[index];
  if (!image || !image.processedFormats) return;
  
  let fileToDownload: File | null = null;
  
  switch (format) {
    case 'jpeg':
      fileToDownload = image.processedFormats.jpeg || null;
      break;
    case 'webp':
      fileToDownload = image.processedFormats.webp || null;
      break;
    case 'avif':
      fileToDownload = image.processedFormats.avif || null;
      break;
    default:
      fileToDownload = null;
  }
  
  if (!fileToDownload) {
    toast({
      variant: "destructive",
      title: "Download Failed",
      description: `No ${format.toUpperCase()} version available for ${image.original.name}`
    });
    return;
  }
  
  // Create WordPress-friendly filename
  const baseName = (image.newFilename || image.original.name).split('.')[0];
  const safeBaseName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const fileName = `${safeBaseName}.${format === 'jpeg' ? 'jpg' : format}`;
  
  // Download the file
  const link = document.createElement('a');
  link.href = URL.createObjectURL(fileToDownload);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  
  // Track download event
  trackEvent('download_format', {
    format,
    imageName: image.original.name,
    fileSize: fileToDownload.size
  });
  
  toast({
    title: "Download Complete",
    description: `Downloaded ${fileName}`
  });
}

export async function downloadAllFormatsUtil(
  index: number,
  processedImages: ProcessedImage[]
): Promise<void> {
  const image = processedImages[index];
  if (!image || !image.processedFormats) {
    toast({
      variant: "destructive",
      title: "Download Failed",
      description: "No processed formats available"
    });
    return;
  }
  
  try {
    // Load JSZip dynamically
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    // Create WordPress-friendly base name
    const baseName = (image.newFilename || image.original.name).split('.')[0];
    const safeBaseName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Add each available format to the ZIP
    if (image.processedFormats.jpeg) {
      zip.file(`${safeBaseName}.jpg`, image.processedFormats.jpeg);
    }
    
    if (image.processedFormats.webp) {
      zip.file(`${safeBaseName}.webp`, image.processedFormats.webp);
    }
    
    if (image.processedFormats.avif) {
      zip.file(`${safeBaseName}.avif`, image.processedFormats.avif);
    }
    
    // Generate HTML file with picture element
    const generatePictureHTML = () => {
      const hasAvif = !!image.processedFormats?.avif;
      const hasWebp = !!image.processedFormats?.webp;
      const hasJpeg = !!image.processedFormats?.jpeg;
      
      let html = `<!DOCTYPE html>\n<html>\n<head>\n`;
      html += `  <title>${safeBaseName} - WordPress Image</title>\n`;
      html += `  <meta charset="UTF-8">\n`;
      html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
      html += `  <style>\n`;
      html += `    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }\n`;
      html += `    .image-container { margin: 20px 0; }\n`;
      html += `    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }\n`;
      html += `    h3 { margin-top: 30px; }\n`;
      html += `  </style>\n`;
      html += `</head>\n<body>\n`;
      
      html += `  <h1>${safeBaseName}</h1>\n`;
      html += `  <p>WordPress-optimized image with multiple formats</p>\n\n`;
      
      html += `  <div class="image-container">\n`;
      html += `    <picture>\n`;
      if (hasAvif) {
        html += `      <source srcset="${safeBaseName}.avif" type="image/avif">\n`;
      }
      if (hasWebp) {
        html += `      <source srcset="${safeBaseName}.webp" type="image/webp">\n`;
      }
      if (hasJpeg) {
        html += `      <img src="${safeBaseName}.jpg" alt="Description" loading="lazy"`;
        if (image.dimensions) {
          html += ` width="${image.dimensions.width}" height="${image.dimensions.height}"`;
        }
        html += `>\n`;
      }
      html += `    </picture>\n`;
      html += `  </div>\n\n`;
      
      html += `  <h3>HTML Code:</h3>\n`;
      html += `  <pre><code>&lt;picture&gt;\n`;
      if (hasAvif) {
        html += `  &lt;source srcset="${safeBaseName}.avif" type="image/avif"&gt;\n`;
      }
      if (hasWebp) {
        html += `  &lt;source srcset="${safeBaseName}.webp" type="image/webp"&gt;\n`;
      }
      if (hasJpeg) {
        html += `  &lt;img src="${safeBaseName}.jpg" alt="Description" loading="lazy"`;
        if (image.dimensions) {
          html += ` width="${image.dimensions.width}" height="${image.dimensions.height}"`;
        }
        html += `&gt;\n`;
      }
      html += `&lt;/picture&gt;</code></pre>\n\n`;
      
      html += `  <h3>WordPress Integration:</h3>\n`;
      html += `  <p>Upload all image files to your WordPress media library, then use the HTML code above in your content.</p>\n`;
      
      html += `</body>\n</html>`;
      
      return html;
    };
    
    // Add the HTML file to the ZIP
    zip.file(`${safeBaseName}-wordpress.html`, generatePictureHTML());
    
    // Generate and download the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${safeBaseName}-wp-formats.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    // Track event
    trackEvent('download_all_formats', {
      imageName: image.original.name,
      formats: Object.keys(image.processedFormats).filter(format => !!image.processedFormats[format])
    });
    
    toast({
      title: "Download Complete",
      description: `Downloaded all formats for ${baseName} as ZIP`
    });
  } catch (error) {
    logger.error(`Failed to download all formats: ${error instanceof Error ? error.message : String(error)}`, {
      module: 'MultiFormatDownload'
    });
    
    toast({
      variant: "destructive",
      title: "Download Failed",
      description: "Failed to create ZIP file"
    });
  }
}

export function downloadAllImagesAsZipUtil(
  processedImages: ProcessedImage[]
): void {
  // This would be implemented to download all images in all formats as a ZIP
  // with proper WordPress folder structure
}
