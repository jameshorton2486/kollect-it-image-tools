
import React from 'react';
import { CardDescription, CardTitle } from '@/components/ui/card';
import ImageTools from './ImageTools';

interface ProcessorHeaderProps {
  clearImageCache: () => void;
  clearAnalyticsData: () => void;
}

const ProcessorHeader: React.FC<ProcessorHeaderProps> = ({ clearImageCache, clearAnalyticsData }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <CardTitle className="text-2xl font-bold">Image Processor</CardTitle>
        <CardDescription className="text-muted-foreground mt-1">
          Optimize and process images for your WordPress site
        </CardDescription>
      </div>
      <ImageTools 
        clearImageCache={clearImageCache}
        clearAnalyticsData={clearAnalyticsData}
      />
    </div>
  );
};

export default ProcessorHeader;
