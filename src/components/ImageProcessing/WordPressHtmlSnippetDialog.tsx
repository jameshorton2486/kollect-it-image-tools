
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
import { Copy, Check, Code, Save, Upload } from "lucide-react";
import { toast } from 'sonner';

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
      // Generate alt text from file name
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
            
            <TabsContent value="html" className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md overflow-auto max-h-[400px]">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {htmlSnippet}
                </pre>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleCopy(htmlSnippet)}
                >
                  {copied && activeTab === 'html' ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied && activeTab === 'html' ? "Copied!" : "Copy HTML"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSaveToGoogleDrive}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save to Google Drive
                </Button>
                
                <Button 
                  className="flex-1"
                  onClick={() => {
                    const htmlFile = new Blob([htmlSnippet], { type: 'text/html' });
                    const url = URL.createObjectURL(htmlFile);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `wordpress-snippet-${image.productId || 'image'}.html`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Code className="mr-2 h-4 w-4" />
                  Download HTML File
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="json" className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md overflow-auto max-h-[400px]">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(jsonMetadata, null, 2)}
                </pre>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleCopy(JSON.stringify(jsonMetadata, null, 2))}
              >
                {copied && activeTab === 'json' ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied && activeTab === 'json' ? "Copied!" : "Copy JSON"}
              </Button>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-4">
              <div className="text-sm space-y-4">
                <h3 className="font-medium text-base">How to Use in WordPress</h3>
                
                <div>
                  <h4 className="font-medium mb-1">Using the HTML Block</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>In your WordPress post/page editor, add a new "Custom HTML" block</li>
                    <li>Paste the copied HTML code into the block</li>
                    <li>Preview your post/page to see the responsive image in action</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Using the Gutenberg Image Block</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Upload all image formats (AVIF, WebP, JPEG) to your Media Library</li>
                    <li>Add an Image block to your page</li>
                    <li>For advanced usage, convert the block to Custom HTML and paste the snippet</li>
                  </ol>
                </div>
                
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <h4 className="font-medium mb-1 text-blue-800">Browser Support</h4>
                  <p>The <code>&lt;picture&gt;</code> element provides built-in fallbacks:</p>
                  <ul className="list-disc pl-5 space-y-1 text-blue-700">
                    <li>AVIF: ~79% of browsers (Chrome, Firefox, Opera)</li>
                    <li>WebP: ~96% of browsers (almost universal support)</li>
                    <li>JPEG: 100% of browsers (universal fallback)</li>
                  </ul>
                </div>
              </div>
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
