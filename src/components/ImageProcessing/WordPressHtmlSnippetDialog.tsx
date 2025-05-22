
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
import { Label } from "@/components/ui/label";
import { ProcessedImage } from '@/types/imageProcessing';
import { generatePictureHtml, generateWordPressMetadata } from '@/utils/wordPressUtils';
import { Copy, Check, Code } from "lucide-react";

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
  
  if (!image) return null;
  
  const htmlSnippet = generatePictureHtml(image, includeRetina, lazyLoad);
  const jsonMetadata = generateWordPressMetadata(image);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="flex items-center justify-between">
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
          
          <Tabs defaultValue="html">
            <TabsList>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="json">WordPress JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md overflow-auto max-h-[400px]">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {htmlSnippet}
                </pre>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleCopy(htmlSnippet)}
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy HTML"}
              </Button>
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
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy JSON"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={() => {
              const htmlFile = new Blob([htmlSnippet], { type: 'text/html' });
              const url = URL.createObjectURL(htmlFile);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'wordpress-snippet.html';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Code className="mr-2 h-4 w-4" />
            Save as HTML
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordPressHtmlSnippetDialog;
