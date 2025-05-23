
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { formatBytes } from '@/utils/imageUtils';
import { AnalyticsData } from '@/types/imageProcessing';

interface ProcessingMetricsCardProps {
  analyticsData: AnalyticsData;
}

const ProcessingMetricsCard: React.FC<ProcessingMetricsCardProps> = ({ 
  analyticsData 
}) => {
  // Calculate processing metrics
  const metrics = useMemo(() => {
    const events = analyticsData.events || [];
    
    if (events.length === 0) {
      return {
        avgTimePerImage: 0,
        avgSizeReduction: 0,
        totalProcessingTime: 0,
        maxCompression: 0,
        efficiencyScore: 0
      };
    }
    
    // Calculate total processing time and average time per image
    let totalTime = 0;
    let totalImages = 0;
    let totalSizeReducedBytes = 0;
    let totalInputBytes = 0;
    let maxCompression = 0;
    
    events.forEach(event => {
      totalTime += event.processingTime || 0;
      totalImages += event.imageCount || 0;
      totalInputBytes += event.totalInputSize || 0;
      totalSizeReducedBytes += (event.totalInputSize - event.totalOutputSize) || 0;
      
      const eventCompression = event.compressionRate || 0;
      if (eventCompression > maxCompression) {
        maxCompression = eventCompression;
      }
    });
    
    const avgTimePerImage = totalImages > 0 ? totalTime / totalImages : 0;
    const avgSizeReduction = totalInputBytes > 0 ? (totalSizeReducedBytes / totalInputBytes) * 100 : 0;
    
    // Calculate an efficiency score (0-100)
    // Formula: 70% weight to compression + 30% weight to speed
    const compressionScore = Math.min(100, (avgSizeReduction * 1.25)); // Max 100 at 80% compression
    const speedScore = Math.min(100, Math.max(0, 100 - (avgTimePerImage / 100))); // Lower is better
    const efficiencyScore = Math.round((compressionScore * 0.7) + (speedScore * 0.3));
    
    return {
      avgTimePerImage: avgTimePerImage,
      avgSizeReduction: avgSizeReduction,
      totalProcessingTime: totalTime,
      maxCompression: maxCompression * 100,
      efficiencyScore
    };
  }, [analyticsData]);

  const getEfficiencyRating = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-success-green' };
    if (score >= 75) return { text: 'Very Good', color: 'text-success-green' };
    if (score >= 60) return { text: 'Good', color: 'text-kollect-blue' };
    if (score >= 40) return { text: 'Average', color: 'text-antique-gold' };
    return { text: 'Needs Improvement', color: 'text-warning-amber' };
  };
  
  const rating = getEfficiencyRating(metrics.efficiencyScore);
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Processing Metrics</CardTitle>
        <CardDescription>
          Performance statistics for image optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Gauge className="h-16 w-16 text-muted-foreground" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${rating.color}`}>
                {metrics.efficiencyScore}
              </span>
            </div>
          </div>
          <h4 className={`text-lg font-medium mt-2 ${rating.color}`}>{rating.text}</h4>
          <p className="text-xs text-sage-gray mt-1">Optimization Efficiency Score</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 border border-border rounded-md space-y-1">
            <div className="text-sm text-sage-gray">Avg. Processing Time</div>
            <div className="text-lg font-medium">
              {(metrics.avgTimePerImage / 1000).toFixed(2)}s <span className="text-sm font-normal text-sage-gray">per image</span>
            </div>
          </div>
          
          <div className="p-3 border border-border rounded-md space-y-1">
            <div className="text-sm text-sage-gray">Avg. Size Reduction</div>
            <div className="text-lg font-medium">
              {metrics.avgSizeReduction.toFixed(1)}% <span className="text-sm font-normal text-sage-gray">smaller</span>
            </div>
          </div>
          
          <div className="p-3 border border-border rounded-md space-y-1">
            <div className="text-sm text-sage-gray">Total Processing Time</div>
            <div className="text-lg font-medium">
              {(metrics.totalProcessingTime / 1000 / 60).toFixed(2)} <span className="text-sm font-normal text-sage-gray">minutes</span>
            </div>
          </div>
          
          <div className="p-3 border border-border rounded-md space-y-1">
            <div className="text-sm text-sage-gray">Best Compression</div>
            <div className="text-lg font-medium">
              {metrics.maxCompression.toFixed(1)}% <span className="text-sm font-normal text-sage-gray">reduction</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingMetricsCard;
