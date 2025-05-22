
import { ProcessedImage } from '@/types/imageProcessing';
import { trackEvent } from '@/utils/analytics';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Utility function to download a specific format of a processed image
 */
export const downloadFormatUtil = (index: number, format: string, processedImages: ProcessedImage[]) => {
  const image = processedImages[index];
  if (!image || !image.processedFormats) {
    console.error('Cannot download format: Image or processed formats not available');
    return;
  }

  // Get the requested format
  const formatFile = image.processedFormats[format as keyof typeof image.processedFormats];
  
  if (!formatFile) {
    console.error(`Format ${format} not available for this image`);
    return;
  }
  
  // Generate download filename
  let filename = image.newFilename || image.original.name;
  
  // Ensure filename has the correct extension
  const nameWithoutExtension = filename.replace(/\.[^/.]+$/, "");
  filename = `${nameWithoutExtension}.${format}`;

  // Create download link and trigger download
  const url = URL.createObjectURL(formatFile);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke object URL to free memory
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
  
  // Track download event
  trackEvent("image_format_download", {
    format: format,
    fileSize: formatFile.size,
    filename: filename
  });
  
  return filename;
};

/**
 * Utility function to generate HTML code for the picture element
 */
export const generatePictureHtml = (image: ProcessedImage): string => {
  if (!image.processedFormats) {
    return '';
  }
  
  const baseFilename = image.newFilename || image.original.name.replace(/\.[^/.]+$/, "");
  
  let html = '<picture>\n';
  
  // Add AVIF source if available
  if (image.processedFormats.avif) {
    html += `  <source srcset="${baseFilename}.avif" type="image/avif">\n`;
  }
  
  // Add WebP source if available
  if (image.processedFormats.webp) {
    html += `  <source srcset="${baseFilename}.webp" type="image/webp">\n`;
  }
  
  // Add fallback img tag (always use jpeg if available, otherwise use original)
  const fallbackFormat = image.processedFormats.jpeg ? 'jpeg' : 'jpg';
  const dimensions = image.dimensions ? 
    `width="${image.dimensions.width}" height="${image.dimensions.height}"` : '';
  
  html += `  <img src="${baseFilename}.${fallbackFormat}" alt="" ${dimensions} loading="lazy">\n`;
  html += '</picture>';
  
  return html;
};

/**
 * Utility function to download all available formats for an image as a ZIP
 */
export const downloadAllFormatsUtil = async (index: number, processedImages: ProcessedImage[]) => {
  const image = processedImages[index];
  if (!image || !image.processedFormats) {
    console.error('Cannot download formats: Image or processed formats not available');
    return;
  }
  
  // Create a new JSZip instance
  const zip = new JSZip();
  
  // Base filename without extension
  const baseFilename = image.newFilename || image.original.name.replace(/\.[^/.]+$/, "");
  
  // Add each available format to the zip
  let formatCount = 0;
  if (image.processedFormats.avif) {
    zip.file(`${baseFilename}.avif`, image.processedFormats.avif);
    formatCount++;
  }
  
  if (image.processedFormats.webp) {
    zip.file(`${baseFilename}.webp`, image.processedFormats.webp);
    formatCount++;
  }
  
  if (image.processedFormats.jpeg) {
    zip.file(`${baseFilename}.jpg`, image.processedFormats.jpeg);
    formatCount++;
  }
  
  // Add the HTML snippet
  const htmlSnippet = generatePictureHtml(image);
  zip.file(`${baseFilename}-html-snippet.html`, htmlSnippet);
  
  // Generate the zip file
  const content = await zip.generateAsync({ type: 'blob' });
  
  // Save the zip file
  saveAs(content, `${baseFilename}-all-formats.zip`);
  
  // Track download event
  trackEvent("download_all_formats", {
    formatCount: formatCount,
    imageIndex: index,
    includesAvif: !!image.processedFormats.avif,
    includesWebp: !!image.processedFormats.webp,
    includesJpeg: !!image.processedFormats.jpeg
  });
  
  return `${baseFilename}-all-formats.zip`;
};
