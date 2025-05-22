
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
