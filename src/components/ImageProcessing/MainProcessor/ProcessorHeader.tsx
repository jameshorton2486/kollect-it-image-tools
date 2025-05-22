
import React from 'react';
import { Settings, RefreshCw, Download, FileDigit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

interface ProcessorHeaderProps {
  clearImageCache: () => void;
  clearAnalyticsData: () => void;
}

const ProcessorHeader: React.FC<ProcessorHeaderProps> = ({ 
  clearImageCache, 
  clearAnalyticsData 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <FileDigit className="h-6 w-6 text-brand-blue" />
        <h2 className="text-xl font-semibold">Image Optimization</h2>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex gap-1 items-center"
          onClick={clearImageCache}
        >
          <RefreshCw className="h-4 w-4" />
          Clear Cache
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Image Processor Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearImageCache}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Image Cache
            </DropdownMenuItem>
            <DropdownMenuItem onClick={clearAnalyticsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Analytics Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download All Processed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProcessorHeader;
