import { toast } from '@/components/ui/use-toast';
import { removeBackgroundWithRembg } from './rembgBackgroundRemoval';
import { removeBackgroundWithBriaAi } from './briaBackgroundRemoval';
import { removeBackgroundInBrowser } from './browserBackgroundRemoval';
import { logger, handleError } from './logging';

const API_ENDPOINT = 'https://api.remove.bg/v1.0/removebg';

export interface BackgroundRemovalResult {
  processedFile: File | null;
  error?: string;
}

export async function removeImageBackground(
  imageFile: File, 
  apiKey: string | null,
  selfHosted: boolean = false,
  serverUrl: string = '',
  model: string = 'removebg'
): Promise<BackgroundRemovalResult> {
  logger.info(`Removing background using model: ${model}, selfHosted: ${selfHosted}`, {
    module: 'BackgroundRemoval',
    data: {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      selfHosted,
      hasApiKey: !!apiKey
    }
  });
  
  try {
    // If self-hosted is true, always use rembg regardless of the selected model
    if (selfHosted) {
      logger.info('Using self-hosted Rembg service', { module: 'BackgroundRemoval' });
      return await removeBackgroundWithRembg(imageFile, serverUrl);
    }
    
    // Otherwise, use the selected model's API
    switch(model) {
      case 'browser':
        logger.info('Using in-browser background removal', { module: 'BackgroundRemoval' });
        return await removeBackgroundInBrowser(imageFile);
        
      case 'briaai':
        logger.info('Using Bria AI background removal', { module: 'BackgroundRemoval' });
        return await removeBackgroundWithBriaAi(imageFile, apiKey);
        
      case 'rembg':
        logger.info('Using Rembg background removal service', { module: 'BackgroundRemoval' });
        return await removeBackgroundWithRembg(imageFile, serverUrl);
        
      case 'removebg':
      default:
        logger.info('Using Remove.bg API for background removal', { module: 'BackgroundRemoval' });
        return await removeImageBackgroundWithAPI(imageFile, apiKey);
    }
  } catch (error) {
    const handledError = handleError(error, `Background removal failed for ${imageFile.name}`, false);
    
    return { 
      processedFile: null, 
      error: handledError.message 
    };
  }
}

async function removeImageBackgroundWithAPI(
  imageFile: File, 
  apiKey: string | null
): Promise<BackgroundRemovalResult> {
  if (!apiKey) {
    logger.warn('API key missing for Remove.bg', { module: 'BackgroundRemoval' });
    
    toast({
      variant: "destructive",
      title: "API Key Missing",
      description: "Please provide a Remove.bg API key in settings"
    });
    
    return { processedFile: null, error: "API key missing" };
  }

  try {
    // Create form data for the API request
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', 'auto');
    formData.append('format', 'png');

    logger.info(`Sending request to Remove.bg API for ${imageFile.name}`, {
      module: 'BackgroundRemoval',
      data: { fileSize: imageFile.size }
    });
    
    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = "API error occurred";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.errors?.[0]?.title || "API error occurred";
          logger.error(`Background removal API error: ${errorMessage}`, {
            module: 'BackgroundRemoval',
            data: errorData
          });
        } catch (parseError) {
          logger.error(`Failed to parse API error: ${parseError}`, {
            module: 'BackgroundRemoval',
            data: { status: response.status, statusText: response.statusText }
          });
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        toast({
          variant: "destructive",
          title: "Background Removal Failed",
          description: errorMessage
        });
        
        return { processedFile: null, error: errorMessage };
      }

      // Get the processed image
      const blob = await response.blob();
      
      // Create a new file with the processed image
      const filename = imageFile.name.replace(/\.[^/.]+$/, '') + '-nobg.png';
      const processedFile = new File([blob], filename, { type: 'image/png' });
      
      logger.info(`Successfully removed background from ${imageFile.name}`, {
        module: 'BackgroundRemoval',
        data: {
          originalSize: imageFile.size,
          processedSize: processedFile.size
        }
      });

      return { processedFile };
    } catch (fetchError) {
      // Clear the timeout if it hasn't fired yet
      clearTimeout(timeoutId);
      
      // Handle connection timeout
      if (fetchError.name === 'AbortError') {
        const errorMessage = 'Connection timed out';
        logger.error(`Remove.bg API timeout: ${errorMessage}`, { module: 'BackgroundRemoval' });
        
        toast({
          variant: "destructive",
          title: "Connection Timeout",
          description: "Remove.bg API took too long to respond"
        });
        
        return { processedFile: null, error: errorMessage };
      }
      
      // Re-throw for the outer catch block
      throw fetchError;
    }
  } catch (error) {
    handleError(error, `Remove.bg API error for ${imageFile.name}`, false);
    
    toast({
      variant: "destructive",
      title: "Background Removal Error",
      description: error instanceof Error ? error.message : "Unknown error"
    });
    
    return { 
      processedFile: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
