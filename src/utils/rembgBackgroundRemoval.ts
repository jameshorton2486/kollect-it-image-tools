
import { toast } from '@/components/ui/use-toast';
import { removeBackgroundInBrowser } from './browserBackgroundRemoval';

export interface RembgBackgroundRemovalResult {
  processedFile: File | null;
  error?: string;
}

export async function removeBackgroundWithRembg(
  imageFile: File,
  serverUrl: string
): Promise<RembgBackgroundRemovalResult> {
  if (!serverUrl) {
    toast({
      variant: "destructive",
      title: "Server URL Missing",
      description: "Please provide a valid Rembg server URL"
    });
    return { processedFile: null, error: "Server URL missing" };
  }

  try {
    // Create form data for the API request
    const formData = new FormData();
    formData.append('image', imageFile);

    // Set a timeout for the fetch request - 5 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(serverUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    }).catch(error => {
      // Connection error, try browser fallback
      console.log('Rembg server connection failed, using browser fallback');
      clearTimeout(timeoutId);
      return null;
    });
    
    clearTimeout(timeoutId);

    // If fetch failed or returned an error, use browser fallback
    if (!response || !response.ok) {
      console.log('Using browser fallback for background removal');
      toast({
        title: "Rembg Server Not Available",
        description: "Using browser processing as fallback",
        // Fixed the TypeScript error by using a valid variant
        variant: "destructive"
      });
      
      // Use browser model as fallback
      return await removeBackgroundInBrowser(imageFile);
    }

    // Get the processed image
    const blob = await response.blob();
    // Create a new file with the processed image
    const filename = imageFile.name.replace(/\.[^/.]+$/, '') + '-nobg.png';
    const processedFile = new File([blob], filename, { type: 'image/png' });

    return { processedFile };
  } catch (error) {
    console.error('Background removal error:', error);
    
    // Fall back to browser processing
    console.log('Error with Rembg server, using browser fallback');
    toast({
      title: "Background Removal Fallback",
      description: "Server not available. Using browser processing instead.",
      // Fixed the TypeScript error by using a valid variant
      variant: "destructive"
    });
    
    return await removeBackgroundInBrowser(imageFile);
  }
}
