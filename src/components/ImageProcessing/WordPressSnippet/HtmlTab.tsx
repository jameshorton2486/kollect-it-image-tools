
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check, Code, Save } from "lucide-react";
import { ProcessedImage } from '@/types/imageProcessing';

interface HtmlTabProps {
  htmlSnippet: string;
  copied: boolean;
  onCopy: (text: string) => void;
  onSaveToGoogleDrive: () => void;
  image: ProcessedImage;
}

const HtmlTab: React.FC<HtmlTabProps> = ({
  htmlSnippet,
  copied,
  onCopy,
  onSaveToGoogleDrive,
  image
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-md overflow-auto max-h-[400px]">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {htmlSnippet}
        </pre>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onCopy(htmlSnippet)}
        >
          {copied ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy HTML"}
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onSaveToGoogleDrive}
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
    </div>
  );
};

export default HtmlTab;
