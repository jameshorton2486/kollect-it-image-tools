
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, DownloadCloud, RotateCcw, Settings, BarChart2 } from 'lucide-react';
import { ProcessorHeaderProps } from '@/types/imageProcessing';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ProcessorHeader: React.FC<ProcessorHeaderProps> = ({ 
  clearImageCache,
  clearAnalyticsData
}) => {
  const handleClearCache = () => {
    clearImageCache();
    toast({
      title: "Cache cleared",
      description: "Image cache has been successfully cleared.",
      duration: 3000,
    });
  };
  
  const handleResetAnalytics = () => {
    clearAnalyticsData();
    toast({
      title: "Analytics reset",
      description: "All analytics data has been reset successfully.",
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
      <h2 className="text-2xl font-bold text-gray-800">Image Processor</h2>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClearCache}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear Cache</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleResetAnalytics}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset Analytics</span>
        </Button>
        
        <Link to="/analytics">
          <Button 
            variant="default" 
            size="sm"
            className="flex items-center gap-1 bg-brand-blue hover:bg-brand-dark"
          >
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProcessorHeader;
