
import { ProcessedImage } from '@/types/imageProcessing';
import { generatePictureHtml, generateSchemaOrgData, generateWordPressShortcode } from '../wordPressUtils';
import { saveHtmlSnippet, saveHtmlPreview, getProductNameFromId } from '../googleDriveUtils';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Generate and save WordPress HTML snippets for a processed image
 */
export async function generateWordPressSnippets(image: ProcessedImage, includeSchema: boolean = true): Promise<string> {
  if (!image.processed || !image.productId) {
    throw new Error('Image must be processed and have a product ID to generate WordPress snippets');
  }
  
  const productName = getProductNameFromId(image.productId);
  
  // Generate basic <picture> element HTML
  const pictureHtml = generatePictureHtml(image, true, true, productName);
  
  // Optionally add schema.org JSON-LD
  const schemaHtml = includeSchema ? generateSchemaOrgData(image, productName) : '';
  
  // Combine HTML parts
  const combinedHtml = pictureHtml + (includeSchema ? '\n\n' + schemaHtml : '');
  
  // Save HTML snippet to Google Drive
  try {
    await saveHtmlSnippet(image.productId, combinedHtml);
    
    // Also save a preview HTML page that can be opened in a browser
    await saveHtmlPreview(image.productId, pictureHtml, `Preview: ${productName}`);
    
    return combinedHtml;
  } catch (error) {
    console.error('Error generating WordPress snippets:', error);
    toast.error('Failed to generate WordPress HTML snippets');
    throw error;
  }
}

/**
 * Export all WordPress HTML snippets for a batch of processed images as a ZIP file
 */
export async function exportAllWordPressSnippets(images: ProcessedImage[]): Promise<void> {
  const processedImages = images.filter(img => img.processed && img.productId);
  
  if (processedImages.length === 0) {
    toast.error('No processed images available to export');
    return;
  }
  
  const zip = new JSZip();
  const htmlFolder = zip.folder('wordpress-html-snippets');
  const previewFolder = zip.folder('html-previews');
  
  try {
    // Create promises for all the HTML generation
    const snippetPromises = processedImages.map(async (image) => {
      const productName = getProductNameFromId(image.productId as string);
      
      // Generate HTML components
      const pictureHtml = generatePictureHtml(image, true, true, productName);
      const schemaHtml = generateSchemaOrgData(image, productName);
      const shortcode = generateWordPressShortcode(image, productName);
      
      // Add files to ZIP
      htmlFolder?.file(`${image.productId}-picture.html`, pictureHtml);
      htmlFolder?.file(`${image.productId}-schema.html`, schemaHtml);
      htmlFolder?.file(`${image.productId}-shortcode.txt`, shortcode);
      
      // Create preview HTML
      const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${productName}</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .preview { background: #f5f5f5; padding: 20px; margin: 20px 0; }
    pre { background: #eee; padding: 10px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${productName}</h1>
  <div class="preview">${pictureHtml}</div>
  <h2>HTML Code:</h2>
  <pre>${pictureHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  <h2>Schema.org:</h2>
  <pre>${schemaHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
      
      previewFolder?.file(`${image.productId}-preview.html`, previewHtml);
      
      return { productId: image.productId, html: pictureHtml };
    });
    
    // Wait for all snippets to be generated
    await Promise.all(snippetPromises);
    
    // Add an index.html file that links to all previews
    const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WordPress HTML Snippets</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .product-list { list-style: none; padding: 0; }
    .product-item { padding: 10px; margin-bottom: 10px; background: #f5f5f5; }
    a { color: #0073aa; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>WordPress HTML Snippets</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>
  <ul class="product-list">
    ${processedImages.map(img => `
      <li class="product-item">
        <h2>${getProductNameFromId(img.productId as string)}</h2>
        <p><a href="html-previews/${img.productId}-preview.html" target="_blank">View Preview</a></p>
        <p><small>Product ID: ${img.productId}</small></p>
      </li>
    `).join('')}
  </ul>
</body>
</html>`;
    
    zip.file('index.html', indexHtml);
    
    // Generate the ZIP file
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Prompt download
    saveAs(content, `wordpress-snippets-${Date.now()}.zip`);
    
    toast.success(`WordPress snippets exported for ${processedImages.length} image(s)`);
  } catch (error) {
    console.error('Error exporting WordPress snippets:', error);
    toast.error('Failed to export WordPress HTML snippets');
  }
}
