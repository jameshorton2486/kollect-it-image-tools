
import React, { useState } from 'react';
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
  const [activeButton, setActiveButton] = useState<string | null>(null);
  
  const handleProcessAllClick = () => {
    if (!isProcessing) {
      setActiveButton('process');
      onProcessAll();
    }
  };
  
  const handleDownloadAllClick = () => {
    setActiveButton('download');
    onDownloadAll();
  };
  
  const handleSelectAllClick = () => {
    setActiveButton('selectAll');
    onSelectAll(true);
  };
  
  const handleDeselectAllClick = () => {
    setActiveButton('deselectAll');
    onSelectAll(false);
  };
  
  return (
    <div className="flex justify-between pt-4">
      <div className="space-x-2">
        <Button
          variant="default"
          onClick={handleProcessAllClick}
          disabled={isProcessing}
          className={activeButton === 'process' ? 'bg-brand-light text-brand-blue border border-brand-blue' : ''}
        >
          {isProcessing ? 'Processing...' : 'Process All Selected'}
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadAllClick}
          className={activeButton === 'download' ? 'bg-brand-light text-brand-blue border border-brand-blue' : ''}
        >
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
      </div>
      
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAllClick}
          className={activeButton === 'selectAll' ? 'bg-brand-light text-brand-blue border border-brand-blue' : ''}
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeselectAllClick}
          className={activeButton === 'deselectAll' ? 'bg-brand-light text-brand-blue border border-brand-blue' : ''}
        >
          Deselect All
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
