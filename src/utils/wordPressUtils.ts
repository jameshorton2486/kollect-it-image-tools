
import { ProcessedImage } from '@/types/imageProcessing';

/**
 * Generate a WordPress-friendly filename from the original name, dimensions, and format
 */
export function generateWordPressFilename(
  originalName: string, 
  width: number, 
  height: number, 
  format: string
): string {
  // Remove file extension from original name
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
  
  // Convert to lowercase, replace spaces with dashes, remove non-alphanumeric characters
  const safeBaseName = nameWithoutExtension
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Add dimensions and format
  return `${safeBaseName}-${width}x${height}.${format}`;
}

/**
 * Generate srcset attribute for responsive images
 */
export function generateSrcSet(
  baseFilename: string,
  width: number,
  format: string,
  retinaSizes: number[] = [1, 2]
): string {
  const nameWithoutExtension = baseFilename.replace(/\.[^/.]+$/, "");
  const srcset = retinaSizes.map(scale => {
    const scaledWidth = width * scale;
    return `${nameWithoutExtension}-${scaledWidth}x${scale === 1 ? '' : scale + 'x'}.${format} ${scaledWidth}w`;
  });
  
  return srcset.join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: { width: number; size: string }[]): string {
  const sizesArray = breakpoints.map(bp => `(max-width: ${bp.width}px) ${bp.size}`);
  sizesArray.push('100vw'); // Default size
  
  return sizesArray.join(', ');
}

/**
 * Generate HTML for <picture> element with all available formats
 */
export function generatePictureHtml(
  image: ProcessedImage, 
  includeRetina: boolean = true,
  lazyLoad: boolean = true
): string {
  if (!image.processed) {
    return '';
  }
  
  const baseFilename = image.newFilename || generateWordPressFilename(
    image.original.name,
    image.dimensions?.width || 0,
    image.dimensions?.height || 0,
    'jpg'
  );
  
  const nameWithoutExtension = baseFilename.replace(/\.[^/.]+$/, "");
  const dimensions = image.dimensions;
  const width = dimensions?.width || 0;
  const height = dimensions?.height || 0;
  
  // Standard breakpoints for responsive images
  const breakpoints = [
    { width: 576, size: '100vw' },
    { width: 768, size: '50vw' },
    { width: 992, size: '33vw' }
  ];
  
  const sizes = generateSizes(breakpoints);
  
  // Start building the picture element
  let html = '<picture>\n';
  
  // AVIF format (if available)
  if (image.processedFormats?.avif) {
    const avifSrcset = includeRetina
      ? generateSrcSet(nameWithoutExtension, width, 'avif', [1, 2])
      : `${nameWithoutExtension}.avif ${width}w`;
      
    html += `  <source srcset="${avifSrcset}" type="image/avif" sizes="${sizes}">\n`;
  }
  
  // WebP format (if available)
  if (image.processedFormats?.webp) {
    const webpSrcset = includeRetina
      ? generateSrcSet(nameWithoutExtension, width, 'webp', [1, 2])
      : `${nameWithoutExtension}.webp ${width}w`;
      
    html += `  <source srcset="${webpSrcset}" type="image/webp" sizes="${sizes}">\n`;
  }
  
  // Fallback to JPEG format
  const jpegSrcset = includeRetina
    ? generateSrcSet(nameWithoutExtension, width, 'jpg', [1, 2])
    : `${nameWithoutExtension}.jpg ${width}w`;
    
  // The img element (fallback)
  const imgAttributes = [
    `src="${nameWithoutExtension}.jpg"`,
    `alt=""`,
    width && height ? `width="${width}" height="${height}"` : '',
    `srcset="${jpegSrcset}"`,
    `sizes="${sizes}"`,
    lazyLoad ? 'loading="lazy"' : ''
  ].filter(Boolean).join(' ');
  
  html += `  <img ${imgAttributes}>\n`;
  html += '</picture>';
  
  return html;
}

/**
 * Generate WordPress-compatible JSON metadata for an image
 */
export function generateWordPressMetadata(image: ProcessedImage): Record<string, any> {
  if (!image.processed || !image.dimensions) return {};
  
  const { width, height } = image.dimensions;
  const filename = image.newFilename || generateWordPressFilename(
    image.original.name,
    width,
    height,
    'jpg'
  );
  
  // Calculate file sizes for different formats
  const fileSizes = {
    original: image.original.size,
    processed: image.processed.size,
    webp: image.processedFormats?.webp?.size || null,
    avif: image.processedFormats?.avif?.size || null
  };
  
  return {
    id: Date.now(), // Placeholder for a unique ID
    title: filename,
    filename,
    filesize: fileSizes.processed,
    alt: "",
    src: filename,
    date: new Date().toISOString(),
    meta: {
      width,
      height,
      file: filename,
      sizes: {
        thumbnail: {
          width: Math.min(150, width),
          height: Math.min(150, height),
          file: generateWordPressFilename(
            image.original.name,
            Math.min(150, width),
            Math.min(150, height),
            'jpg'
          )
        },
        medium: {
          width: Math.min(300, width),
          height: Math.min(300, height),
          file: generateWordPressFilename(
            image.original.name,
            Math.min(300, width),
            Math.min(300, height),
            'jpg'
          )
        }
      },
      image_meta: {
        created_timestamp: Math.floor(Date.now() / 1000),
        copyright: "",
        title: filename,
        formats: {
          jpeg: { filesize: fileSizes.processed },
          webp: fileSizes.webp ? { filesize: fileSizes.webp } : null,
          avif: fileSizes.avif ? { filesize: fileSizes.avif } : null
        }
      }
    }
  };
}
