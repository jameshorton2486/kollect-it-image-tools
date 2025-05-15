
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

interface ActionButtonsProps {
  isProcessing: boolean;
  onProcessAll: () => void;
  onDownloadAll: () => void;
  onSelectAll: (selected: boolean) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isProcessing,
  onProcessAll,
  onDownloadAll,
  onSelectAll
}) => {
  return (
    <div className="flex justify-between pt-4">
      <div className="space-x-2">
        <Button
          variant="default"
          onClick={onProcessAll}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Process All Selected'}
        </Button>
        <Button
          variant="outline"
          onClick={onDownloadAll}
        >
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
      </div>
      
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectAll(true)}
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectAll(false)}
        >
          Deselect All
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
