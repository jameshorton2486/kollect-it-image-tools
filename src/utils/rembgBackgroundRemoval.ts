
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

    // Set a timeout for the fetch request - increase to 15 seconds for larger images
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    console.log(`Connecting to Rembg server at ${serverUrl}...`);
    
    const response = await fetch(serverUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    }).catch(error => {
      // Connection error, try browser fallback
      console.log('Rembg server connection failed:', error);
      clearTimeout(timeoutId);
      
      toast({
        title: "Rembg Server Not Available",
        description: "Connection failed. Using browser processing as fallback",
        variant: "destructive"
      });
      
      return null;
    });
    
    clearTimeout(timeoutId);

    // If fetch failed or returned an error, use browser fallback
    if (!response || !response.ok) {
      console.log('Using browser fallback for background removal');
      
      let errorMessage = "Server unavailable";
      if (response) {
        try {
          const errorData = await response.text();
          errorMessage = `Server error: ${errorData || response.statusText}`;
          console.error('Server error:', errorMessage);
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      
      toast({
        title: "Rembg Server Error",
        description: "Using browser processing as fallback. " + errorMessage,
        variant: "destructive"
      });
      
      // Use browser model as fallback
      return await removeBackgroundInBrowser(imageFile);
    }

    console.log('Rembg server processing successful');
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
      description: "Server error occurred. Using browser processing instead.",
      variant: "destructive"
    });
    
    return await removeBackgroundInBrowser(imageFile);
  }
}
