
import React from 'react';
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onReset }) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <ImageIcon size={48} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium mb-2">No Images to Process</h3>
      <p className="text-gray-500 mb-4">
        Upload some images to get started
      </p>
      <Button onClick={onReset}>
        Upload Images
      </Button>
    </div>
  );
};

export default EmptyState;
