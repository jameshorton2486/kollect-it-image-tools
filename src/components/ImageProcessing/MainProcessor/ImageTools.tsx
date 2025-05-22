
import React from 'react';
import { Database, RefreshCw, BarChart3, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

interface ImageToolsProps {
  clearImageCache: () => void;
  clearAnalyticsData: () => void;
}

const ImageTools: React.FC<ImageToolsProps> = ({ clearImageCache, clearAnalyticsData }) => {
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={clearImageCache}
              className="gap-1"
            >
              <Database className="h-4 w-4" />
              <RefreshCw className="h-3 w-3" />
              Clear Cache
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear image processing cache to free up browser storage</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Link to="/analytics">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View processing statistics and usage analytics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Link>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => window.open('https://docs.kollect-it.com/image-processor', '_blank')}
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View user guide and documentation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ImageTools;
