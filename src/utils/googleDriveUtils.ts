
import { toast } from 'sonner';

// Base folder paths
export const DRIVE_BASE_PATH = 'G:\\My Drive\\Kollect-It\\Kollect-It Media';
export const RAW_UPLOADS_PATH = `${DRIVE_BASE_PATH}\\Raw Uploads`;
export const PROCESSED_IMAGES_PATH = `${DRIVE_BASE_PATH}\\Processed Images`;
export const HTML_SNIPPETS_PATH = `${DRIVE_BASE_PATH}\\HTML Snippets`;

export interface FolderStructure {
  basePath: string;
  rawUploadsPath: string;
  processedImagesPath: string;
  htmlSnippetsPath: string;
}

export const DEFAULT_FOLDER_STRUCTURE: FolderStructure = {
  basePath: DRIVE_BASE_PATH,
  rawUploadsPath: RAW_UPLOADS_PATH,
  processedImagesPath: PROCESSED_IMAGES_PATH,
  htmlSnippetsPath: HTML_SNIPPETS_PATH,
};

/**
 * Creates the necessary folder structure if it doesn't exist
 * Note: In a web application, this is simulated as actual folder creation
 * would require Node.js/Electron or similar platform with file system access
 */
export function ensureFolderStructure(): FolderStructure {
  // In a real application, this would use Node.js fs or Electron APIs
  // to check if folders exist and create them if they don't
  
  // For now, we'll just simulate this process
  console.log('Ensuring folder structure exists at:', DRIVE_BASE_PATH);
  
  // Get folder structure from localStorage or use default
  const savedStructure = localStorage.getItem('driveFileStructure');
  let folderStructure = DEFAULT_FOLDER_STRUCTURE;
  
  if (savedStructure) {
    try {
      folderStructure = JSON.parse(savedStructure);
    } catch (error) {
      console.error('Error parsing saved folder structure, using default', error);
    }
  } else {
    // Save default structure to localStorage
    localStorage.setItem('driveFileStructure', JSON.stringify(folderStructure));
  }
  
  return folderStructure;
}

/**
 * Gets the product folder path
 */
export function getProductFolderPath(productId: string): string {
  return `${PROCESSED_IMAGES_PATH}\\${productId}`;
}

/**
 * Simulates saving a file to the Google Drive structure
 * @param file The file to save
 * @param targetPath The target path to save to
 * @returns Promise that resolves when the file is "saved"
 */
export function saveFileToDrive(file: File, targetPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    // In a real app, this would use APIs to write to the file system
    console.log(`[Drive] Saving file ${file.name} to ${targetPath}`);
    
    // Simulate a slight delay for the "save" operation
    setTimeout(() => {
      toast.success(`File saved to ${targetPath}\\${file.name}`);
      resolve(true);
    }, 300);
  });
}

/**
 * Simulates saving HTML content to a file in the HTML Snippets folder
 */
export function saveHtmlSnippet(productId: string, html: string): Promise<boolean> {
  return new Promise((resolve) => {
    const filename = `${productId}-wordpress-html.html`;
    const targetPath = `${HTML_SNIPPETS_PATH}\\${filename}`;
    
    console.log(`[Drive] Saving HTML snippet for product ${productId} to ${targetPath}`);
    
    // Simulate a slight delay for the "save" operation
    setTimeout(() => {
      toast.success(`HTML snippet saved to ${targetPath}`);
      resolve(true);
    }, 300);
  });
}

/**
 * Simulates saving a full HTML page with preview to the HTML Snippets folder
 */
export function saveHtmlPreview(productId: string, html: string, title: string = 'WordPress Image Preview'): Promise<boolean> {
  return new Promise((resolve) => {
    const filename = `${productId}-preview.html`;
    const targetPath = `${HTML_SNIPPETS_PATH}\\${filename}`;
    
    // Wrap the HTML in a complete HTML document with preview styling
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
      background-color: #f7f7f7;
    }
    .preview-container {
      background-color: white;
      padding: 30px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .code-container {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 5px;
      margin-top: 30px;
      overflow-x: auto;
    }
    pre {
      margin: 0;
      font-family: monospace;
      white-space: pre-wrap;
    }
    h1 {
      color: #2271b1;
      margin-top: 0;
    }
    .image-info {
      background-color: #f0f8ff;
      padding: 15px;
      border-left: 4px solid #0073aa;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>WordPress Image Preview</h1>
  <div class="image-info">
    <p><strong>Product ID:</strong> ${productId}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  </div>
  
  <h2>Preview</h2>
  <div class="preview-container">
    ${html}
  </div>
  
  <h2>HTML Code</h2>
  <div class="code-container">
    <pre><code>${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
  </div>
</body>
</html>
    `;
    
    console.log(`[Drive] Saving HTML preview for product ${productId} to ${targetPath}`);
    
    // Simulate a slight delay for the "save" operation
    setTimeout(() => {
      toast.success(`HTML preview saved to ${targetPath}`);
      resolve(true);
    }, 300);
  });
}

/**
 * Generates a product ID from an image filename or provided ID
 */
export function generateProductId(image: File | string, existingId?: string): string {
  if (existingId) return existingId;
  
  const filename = typeof image === 'string' ? image : image.name;
  // Extract base name without extension and convert to kebab case
  const baseName = filename
    .split('.')[0]
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
    
  // Add a timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-6);
  return `${baseName}-${timestamp}`;
}

/**
 * Extracts the product name from a product ID
 */
export function getProductNameFromId(productId: string): string {
  // Remove the timestamp suffix (last 6 digits)
  const nameWithDashes = productId.replace(/-\d{6}$/, '');
  // Convert to title case
  return nameWithDashes
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Simulates exporting all product data as a single zip file
 */
export function exportAllProductsAsZip(products: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const zipFilePath = `${DRIVE_BASE_PATH}\\kollect-it-export-${Date.now()}.zip`;
    
    console.log(`[Drive] Exporting ${products.length} product(s) to ${zipFilePath}`);
    
    // Simulate a longer delay for the "zip" operation
    setTimeout(() => {
      toast.success(`All products exported to ${zipFilePath}`);
      resolve(true);
    }, 800);
  });
}
