
import { toast } from '@/components/ui/use-toast';
import { BackgroundRemovalResult } from './backgroundRemovalApi';

const API_ENDPOINT = 'https://api.bria.ai/remove-background';

export async function removeBackgroundWithBriaAi(
  imageFile: File,
  apiKey: string | null
): Promise<BackgroundRemovalResult> {
  if (!apiKey) {
    toast({
      variant: "destructive",
      title: "API Key Missing",
      description: "Please provide a BRIA AI API key in settings"
    });
    return { processedFile: null, error: "API key missing" };
  }

  // Create form data for the API request
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
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
      
      console.error('BRIA AI background removal failed:', errorMessage);
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
    console.error('BRIA AI background removal error:', error);
    toast({
      variant: "destructive",
      title: "Background Removal Error",
      description: error instanceof Error ? error.message : "Connection error"
    });
    return { processedFile: null, error: error instanceof Error ? error.message : "Connection error" };
  }
}
