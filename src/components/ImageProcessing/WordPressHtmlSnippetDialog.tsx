
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProcessedImage } from '@/types/imageProcessing';
import { generatePictureHtml, generateWordPressMetadata } from '@/utils/wordPressUtils';
import { saveHtmlSnippet } from '@/utils/googleDriveUtils';
import { toast } from 'sonner';
import HtmlTab from './WordPressSnippet/HtmlTab';
import JsonTab from './WordPressSnippet/JsonTab';
import UsageTab from './WordPressSnippet/UsageTab';

interface WordPressHtmlSnippetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ProcessedImage | null;
}

const WordPressHtmlSnippetDialog: React.FC<WordPressHtmlSnippetDialogProps> = ({
  open,
  onOpenChange,
  image
}) => {
  const [includeRetina, setIncludeRetina] = useState<boolean>(true);
  const [lazyLoad, setLazyLoad] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("html");
  const [snippetFormat, setSnippetFormat] = useState<'picture' | 'figure'>('picture');
  const [altText, setAltText] = useState<string>("");
  
  if (!image) return null;
  
  // Update alt text when image changes
  React.useEffect(() => {
    if (image) {
      const fileName = image.newFilename || image.original.name;
      const nameWithoutExtension = fileName.split('.')[0];
      const formattedName = nameWithoutExtension
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      setAltText(formattedName);
    }
  }, [image]);
  
  const htmlSnippet = generatePictureHtml(image, includeRetina, lazyLoad, altText, snippetFormat);
  const jsonMetadata = generateWordPressMetadata(image, altText);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSaveToGoogleDrive = async () => {
    if (!image.productId) {
      toast.error("No product ID available for this image");
      return;
    }
    
    try {
      await saveHtmlSnippet(image.productId, htmlSnippet);
      toast.success("HTML snippet saved to Google Drive");
    } catch (error) {
      toast.error("Failed to save HTML snippet to Google Drive");
      console.error("Error saving HTML snippet:", error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>WordPress HTML Snippet</DialogTitle>
          <DialogDescription>
            Use this HTML code in your WordPress site for optimized responsive images
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input 
                id="alt-text" 
                value={altText} 
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Image description for accessibility"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="snippet-format">HTML Format</Label>
              <Select 
                value={snippetFormat} 
                onValueChange={(value: 'picture' | 'figure') => setSnippetFormat(value)}
              >
                <SelectTrigger id="snippet-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="picture">Picture Element (multi-format)</SelectItem>
                  <SelectItem value="figure">Figure with Caption</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="retina" 
                checked={includeRetina}
                onCheckedChange={setIncludeRetina}
              />
              <Label htmlFor="retina">Include Retina (@2x) variants</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="lazy" 
                checked={lazyLoad}
                onCheckedChange={setLazyLoad}
              />
              <Label htmlFor="lazy">Enable Lazy Loading</Label>
            </div>
          </div>
          
          <Tabs defaultValue="html" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="json">WordPress JSON</TabsTrigger>
              <TabsTrigger value="usage">Usage Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html">
              <HtmlTab 
                htmlSnippet={htmlSnippet}
                copied={copied && activeTab === 'html'}
                onCopy={handleCopy}
                onSaveToGoogleDrive={handleSaveToGoogleDrive}
                image={image}
              />
            </TabsContent>
            
            <TabsContent value="json">
              <JsonTab 
                jsonMetadata={jsonMetadata}
                copied={copied && activeTab === 'json'}
                onCopy={handleCopy}
              />
            </TabsContent>
            
            <TabsContent value="usage">
              <UsageTab />
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordPressHtmlSnippetDialog;
