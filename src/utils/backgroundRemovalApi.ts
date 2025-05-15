
import { toast } from '@/components/ui/use-toast';

const API_ENDPOINT = 'https://api.remove.bg/v1.0/removebg';

export interface BackgroundRemovalResult {
  processedFile: File | null;
  error?: string;
}

export async function removeImageBackground(
  imageFile: File, 
  apiKey: string | null
): Promise<BackgroundRemovalResult> {
  if (!apiKey) {
    toast({
      variant: "destructive",
      title: "API Key Missing",
      description: "Please provide a Remove.bg API key in settings"
    });
    return { processedFile: null, error: "API key missing" };
  }

  // Create form data for the API request
  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('size', 'auto');
  formData.append('format', 'png');

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Background removal failed:', errorData);
      toast({
        variant: "destructive",
        title: "Background Removal Failed",
        description: errorData.errors?.[0]?.title || "API error occurred"
      });
      return { processedFile: null, error: errorData.errors?.[0]?.title || "API error occurred" };
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
      description: error instanceof Error ? error.message : "Unknown error"
    });
    return { processedFile: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
