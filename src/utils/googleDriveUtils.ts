import { toast } from 'sonner';
import { googleDriveService } from './googleDriveService';

// Base folder paths - these are now virtual paths for reference
export const DRIVE_BASE_PATH = 'Google Drive/Kollect-It Media';
export const RAW_UPLOADS_PATH = `${DRIVE_BASE_PATH}/Raw Uploads`;
export const PROCESSED_IMAGES_PATH = `${DRIVE_BASE_PATH}/Processed Images`;
export const HTML_SNIPPETS_PATH = `${DRIVE_BASE_PATH}/HTML Snippets`;

export interface FolderStructure {
  basePath: string;
  rawUploadsPath: string;
  processedImagesPath: string;
  htmlSnippetsPath: string;
  baseFolderId?: string;
  rawUploadsFolderId?: string;
  processedImagesFolderId?: string;
  htmlSnippetsFolderId?: string;
}

export const DEFAULT_FOLDER_STRUCTURE: FolderStructure = {
  basePath: DRIVE_BASE_PATH,
  rawUploadsPath: RAW_UPLOADS_PATH,
  processedImagesPath: PROCESSED_IMAGES_PATH,
  htmlSnippetsPath: HTML_SNIPPETS_PATH,
};

/**
 * Creates the necessary folder structure if it doesn't exist
 */
export async function ensureFolderStructure(): Promise<FolderStructure> {
  if (!googleDriveService.isConfigured()) {
    console.log('Google Drive not configured, using simulated folder structure');
    return DEFAULT_FOLDER_STRUCTURE;
  }

  try {
    const folderIds = await googleDriveService.ensureFolderStructure();
    
    const folderStructure: FolderStructure = {
      ...DEFAULT_FOLDER_STRUCTURE,
      baseFolderId: folderIds.baseFolderId,
      rawUploadsFolderId: folderIds.rawUploadsFolderId,
      processedImagesFolderId: folderIds.processedImagesFolderId,
      htmlSnippetsFolderId: folderIds.htmlSnippetsFolderId,
    };

    // Save structure to localStorage for reference
    localStorage.setItem('driveFileStructure', JSON.stringify(folderStructure));
    
    return folderStructure;
  } catch (error) {
    console.error('Error ensuring folder structure:', error);
    return DEFAULT_FOLDER_STRUCTURE;
  }
}

/**
 * Gets the product folder path and creates it if necessary
 */
export async function getProductFolderPath(productId: string): Promise<{ path: string; folderId?: string }> {
  const folderStructure = await ensureFolderStructure();
  
  if (!googleDriveService.isConfigured()) {
    return { path: `${PROCESSED_IMAGES_PATH}/${productId}` };
  }

  try {
    // Check if product folder exists
    let productFolderId = await googleDriveService.findFolderByName(
      productId, 
      folderStructure.processedImagesFolderId
    );

    // Create if it doesn't exist
    if (!productFolderId && folderStructure.processedImagesFolderId) {
      productFolderId = await googleDriveService.createFolder(
        productId, 
        folderStructure.processedImagesFolderId
      );
    }

    return {
      path: `${PROCESSED_IMAGES_PATH}/${productId}`,
      folderId: productFolderId || undefined,
    };
  } catch (error) {
    console.error('Error getting product folder:', error);
    return { path: `${PROCESSED_IMAGES_PATH}/${productId}` };
  }
}

/**
 * Saves a file to Google Drive
 */
export async function saveFileToDrive(
  file: File, 
  targetPath: string, 
  folderId?: string
): Promise<boolean> {
  if (!googleDriveService.isConfigured()) {
    console.log(`[Drive] Simulating save of ${file.name} to ${targetPath}`);
    toast.success(`File saved to ${targetPath}/${file.name} (simulated)`);
    return true;
  }

  try {
    const result = await googleDriveService.uploadFile(file, file.name, folderId);
    
    if (result.success) {
      toast.success(`File uploaded to Google Drive: ${file.name}`);
      return true;
    } else {
      toast.error(`Upload failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload file to Google Drive');
    return false;
  }
}

/**
 * Saves HTML content to Google Drive
 */
export async function saveHtmlSnippet(productId: string, html: string): Promise<boolean> {
  const filename = `${productId}-wordpress-html.html`;
  const htmlBlob = new Blob([html], { type: 'text/html' });
  const htmlFile = new File([htmlBlob], filename, { type: 'text/html' });

  if (!googleDriveService.isConfigured()) {
    console.log(`[Drive] Simulating HTML save for ${productId}`);
    toast.success(`HTML snippet saved to ${HTML_SNIPPETS_PATH}/${filename} (simulated)`);
    return true;
  }

  try {
    const folderStructure = await ensureFolderStructure();
    const result = await googleDriveService.uploadFile(
      htmlFile, 
      filename, 
      folderStructure.htmlSnippetsFolderId
    );

    if (result.success) {
      toast.success(`HTML snippet uploaded to Google Drive: ${filename}`);
      return true;
    } else {
      toast.error(`HTML upload failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error('HTML upload error:', error);
    toast.error('Failed to upload HTML snippet');
    return false;
  }
}

/**
 * Saves a full HTML page with preview to Google Drive
 */
export async function saveHtmlPreview(
  productId: string, 
  html: string, 
  title: string = 'WordPress Image Preview'
): Promise<boolean> {
  const filename = `${productId}-preview.html`;
  
  // ... keep existing code (HTML template generation)
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

  const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
  const htmlFile = new File([htmlBlob], filename, { type: 'text/html' });

  return await saveFileToDrive(htmlFile, `${HTML_SNIPPETS_PATH}/${filename}`);
}

/**
 * Generates a product ID from an image filename or provided ID
 */
export function generateProductId(image: File | string, existingId?: string): string {
  if (existingId) return existingId;
  
  const filename = typeof image === 'string' ? image : image.name;
  const baseName = filename
    .split('.')[0]
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
    
  const timestamp = Date.now().toString().slice(-6);
  return `${baseName}-${timestamp}`;
}

/**
 * Extracts the product name from a product ID
 */
export function getProductNameFromId(productId: string): string {
  const nameWithDashes = productId.replace(/-\d{6}$/, '');
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
    const zipFilePath = `${DRIVE_BASE_PATH}/kollect-it-export-${Date.now()}.zip`;
    
    console.log(`[Drive] Exporting ${products.length} product(s) to ${zipFilePath}`);
    
    setTimeout(() => {
      toast.success(`All products exported to ${zipFilePath}`);
      resolve(true);
    }, 800);
  });
}
