
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface JsonTabProps {
  jsonMetadata: any;
  copied: boolean;
  onCopy: (text: string) => void;
}

const JsonTab: React.FC<JsonTabProps> = ({
  jsonMetadata,
  copied,
  onCopy
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-md overflow-auto max-h-[400px]">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {JSON.stringify(jsonMetadata, null, 2)}
        </pre>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => onCopy(JSON.stringify(jsonMetadata, null, 2))}
      >
        {copied ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        {copied ? "Copied!" : "Copy JSON"}
      </Button>
    </div>
  );
};

export default JsonTab;
