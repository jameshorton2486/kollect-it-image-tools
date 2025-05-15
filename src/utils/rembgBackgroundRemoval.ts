
import { toast } from '@/components/ui/use-toast';

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

  // Create form data for the API request
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Failed to remove background";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If parsing fails, use the default error message
      }
      
      console.error('Background removal failed:', errorMessage);
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

    return { processedFile };
  } catch (error) {
    console.error('Background removal error:', error);
    toast({
      variant: "destructive",
      title: "Background Removal Error",
      description: error instanceof Error ? error.message : "Connection error"
    });
    return { processedFile: null, error: error instanceof Error ? error.message : "Connection error" };
  }
}
