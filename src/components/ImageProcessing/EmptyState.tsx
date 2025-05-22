
import React from 'react';
import { Image, Upload, ArrowUpFromLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  onReset: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-10 border-dashed border-2 border-muted-foreground/20 bg-muted/5 rounded-lg">
      <div className="bg-brand-blue/10 p-4 rounded-full mb-4">
        <Image className="h-10 w-10 text-brand-blue" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Images to Process</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Upload images to begin optimizing them for web. We support JPG, PNG, WebP, SVG and more formats.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <ArrowUpFromLine className="h-4 w-4" />
          <span>Upload Images</span>
        </Button>
        <Button 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          <span>Select from Library</span>
        </Button>
      </div>
    </Card>
  );
};

export default EmptyState;
