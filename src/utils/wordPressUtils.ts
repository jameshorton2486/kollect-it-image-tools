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
  lazyLoad: boolean = true,
  altText: string = '',
  format: 'picture' | 'figure' = 'picture'
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
  
  // Clean up alt text - if none provided, generate from filename
  const finalAltText = altText || nameWithoutExtension.replace(/-/g, ' ');
  
  // If format is figure, generate a <figure> element with caption
  if (format === 'figure') {
    let html = '<figure class="wp-block-image size-full">\n';
    
    // The img element
    const imgAttributes = [
      `src="${nameWithoutExtension}.jpg"`,
      `alt="${finalAltText}"`,
      width && height ? `width="${width}" height="${height}"` : '',
      lazyLoad ? 'loading="lazy"' : '',
      `class="wp-image-${image.productId || Date.now()}"`
    ].filter(Boolean).join(' ');
    
    html += `  <img ${imgAttributes}>\n`;
    html += `  <figcaption class="wp-element-caption">${finalAltText}</figcaption>\n`;
    html += '</figure>';
    
    return html;
  }
  
  // Otherwise generate a <picture> element
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
    `alt="${finalAltText}"`,
    width && height ? `width="${width}" height="${height}"` : '',
    `srcset="${jpegSrcset}"`,
    `sizes="${sizes}"`,
    lazyLoad ? 'loading="lazy"' : '',
    image.productId ? `class="wp-image-${image.productId}"` : ''
  ].filter(Boolean).join(' ');
  
  html += `  <img ${imgAttributes}>\n`;
  html += '</picture>';
  
  return html;
}

/**
 * Generate WordPress-compatible JSON metadata for an image
 */
export function generateWordPressMetadata(image: ProcessedImage, altText: string = ''): Record<string, any> {
  if (!image.processed || !image.dimensions) return {};
  
  const { width, height } = image.dimensions;
  const filename = image.newFilename || generateWordPressFilename(
    image.original.name,
    width,
    height,
    'jpg'
  );
  
  // Clean up alt text - if none provided, generate from filename
  const nameWithoutExtension = filename.split('.')[0];
  const finalAltText = altText || nameWithoutExtension.replace(/-/g, ' ');
  
  // Calculate file sizes for different formats
  const fileSizes = {
    original: image.original.size,
    processed: image.processed.size,
    webp: image.processedFormats?.webp?.size || null,
    avif: image.processedFormats?.avif?.size || null
  };
  
  // Generate WordPress attachment ID, either from productId or current timestamp
  const attachmentId = image.productId ? 
    parseInt(image.productId.replace(/\D/g, '').slice(-5), 10) : 
    Math.floor(Date.now() / 1000);
  
  return {
    id: attachmentId,
    title: filename,
    filename,
    filesize: fileSizes.processed,
    alt: finalAltText,
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
        },
        large: {
          width: Math.min(1024, width),
          height: Math.min(1024, height),
          file: generateWordPressFilename(
            image.original.name,
            Math.min(1024, width),
            Math.min(1024, height),
            'jpg'
          )
        }
      },
      image_meta: {
        created_timestamp: Math.floor(Date.now() / 1000),
        copyright: "",
        title: filename,
        caption: finalAltText,
        alt: finalAltText,
        description: `Optimized image for: ${finalAltText}`,
        formats: {
          jpeg: { filesize: fileSizes.processed },
          webp: fileSizes.webp ? { filesize: fileSizes.webp } : null,
          avif: fileSizes.avif ? { filesize: fileSizes.avif } : null
        }
      }
    },
    // SEO attributes
    seo: {
      focus_keyword: finalAltText.split(' ').filter(w => w.length > 3).join(', '),
      title: finalAltText,
      metadesc: `Optimized image of ${finalAltText}`,
      linkdex: "0",
      metakeywords: ""
    }
  };
}

/**
 * Generate WordPress schema.org structured data for an image
 */
export function generateSchemaOrgData(image: ProcessedImage, altText: string = ''): string {
  if (!image.processed || !image.dimensions) return '';
  
  const { width, height } = image.dimensions;
  const filename = image.newFilename || image.original.name;
  const nameWithoutExtension = filename.split('.')[0];
  const finalAltText = altText || nameWithoutExtension.replace(/-/g, ' ');
  
  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "ImageObject",
    "contentUrl": filename,
    "name": finalAltText,
    "description": `Optimized image for: ${finalAltText}`,
    "width": width,
    "height": height,
    "encodingFormat": image.processedFormats?.avif ? "image/avif" : 
                      image.processedFormats?.webp ? "image/webp" : "image/jpeg"
  };
  
  return `<script type="application/ld+json">\n${JSON.stringify(schemaData, null, 2)}\n</script>`;
}

/**
 * Generate WordPress image shortcode
 */
export function generateWordPressShortcode(image: ProcessedImage, altText: string = ''): string {
  if (!image.processed || !image.dimensions) return '';
  
  const { width, height } = image.dimensions;
  const filename = image.newFilename || image.original.name;
  const nameWithoutExtension = filename.split('.')[0];
  const finalAltText = altText || nameWithoutExtension.replace(/-/g, ' ');
  
  // Estimate attachment ID
  const attachmentId = image.productId ? 
    parseInt(image.productId.replace(/\D/g, '').slice(-5), 10) : 
    Math.floor(Date.now() / 1000);
  
  return `[caption id="attachment_${attachmentId}" align="aligncenter" width="${width}"]<img src="${filename}" alt="${finalAltText}" width="${width}" height="${height}" class="size-full wp-image-${attachmentId}" /> ${finalAltText}[/caption]`;
}
