
import { toast } from '@/components/ui/use-toast';

export interface KollectItUploadOptions {
  apiKey: string;
  uploadUrl: string;
  productId?: string;
  productTitle?: string;
  categories?: string[];
  tags?: string[];
}

export interface KollectItUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Upload a processed image to the Kollect-It platform
 */
export async function uploadToKollectIt(
  file: File,
  options: KollectItUploadOptions
): Promise<KollectItUploadResult> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    if (options.productId) {
      formData.append('productId', options.productId);
    }
    
    if (options.productTitle) {
      formData.append('title', options.productTitle);
    }
    
    if (options.categories && options.categories.length > 0) {
      formData.append('categories', JSON.stringify(options.categories));
    }
    
    if (options.tags && options.tags.length > 0) {
      formData.append('tags', JSON.stringify(options.tags));
    }
    
    const response = await fetch(options.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }
    
    const result = await response.json();
    
    return {
      success: true,
      imageUrl: result.imageUrl
    };
  } catch (error) {
    console.error('Kollect-It upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during upload'
    };
  }
}

/**
 * Upload multiple images to Kollect-It platform
 */
export async function batchUploadToKollectIt(
  files: File[],
  options: KollectItUploadOptions,
  onProgress?: (progress: number) => void
): Promise<{
  successCount: number;
  failureCount: number;
  errors: string[];
}> {
  const result = {
    successCount: 0,
    failureCount: 0,
    errors: [] as string[]
  };
  
  for (let i = 0; i < files.length; i++) {
    try {
      const uploadResult = await uploadToKollectIt(files[i], options);
      
      if (uploadResult.success) {
        result.successCount++;
      } else {
        result.failureCount++;
        result.errors.push(`${files[i].name}: ${uploadResult.error}`);
      }
    } catch (error) {
      result.failureCount++;
      result.errors.push(`${files[i].name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Report progress
    if (onProgress) {
      onProgress((i + 1) / files.length * 100);
    }
  }
  
  return result;
}
