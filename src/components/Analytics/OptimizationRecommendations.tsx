
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, Zap, FileType, Clock } from "lucide-react";
import { AnalyticsData } from '@/types/imageProcessing';

interface OptimizationRecommendationsProps {
  analyticsData: AnalyticsData;
}

const OptimizationRecommendations: React.FC<OptimizationRecommendationsProps> = ({ 
  analyticsData 
}) => {
  // Generate recommendations based on analytics data
  const getRecommendations = () => {
    const recommendations: { title: string; description: string; icon: React.ReactNode; }[] = [];
    
    // Check format usage - recommend WebP if not widely used
    const formatUsage = analyticsData.formatUsage || {};
    const webpCount = formatUsage.webp || 0;
    const jpegCount = formatUsage.jpeg || 0;
    const pngCount = formatUsage.png || 0;
    const totalCount = Object.values(formatUsage).reduce((sum, count) => sum + Number(count), 0);
    
    if (totalCount > 0) {
      // If WebP usage is low, recommend it
      if (webpCount / totalCount < 0.5) {
        recommendations.push({
          title: 'Use WebP format',
          description: 'WebP offers better compression than JPEG and PNG while maintaining quality. Consider using it as your primary format.',
          icon: <FileType className="h-5 w-5 text-kollect-blue" />,
        });
      }
      
      // If PNG usage is high without transparency need, suggest JPEG/WebP instead
      if (pngCount / totalCount > 0.3) {
        recommendations.push({
          title: 'Reduce PNG usage',
          description: 'PNG files are larger than JPEG/WebP for photos. Only use PNG when transparency is needed.',
          icon: <Zap className="h-5 w-5 text-warning-amber" />,
        });
      }
    }
    
    // Compression rate recommendations
    const avgCompressionRate = analyticsData.averageCompressionRate || 0;
    if (avgCompressionRate < 0.5) {
      recommendations.push({
        title: 'Increase compression',
        description: 'Your average compression rate is below 50%. Consider using higher compression settings for better size reduction.',
        icon: <TrendingUp className="h-5 w-5 text-success-green" />,
      });
    }
    
    // Processing time recommendations
    let hasLongProcessingTimes = false;
    analyticsData.events.forEach(event => {
      if (event.processingTime / event.imageCount > 5000) { // 5 seconds per image
        hasLongProcessingTimes = true;
      }
    });
    
    if (hasLongProcessingTimes) {
      recommendations.push({
        title: 'Optimize processing speed',
        description: 'Some images are taking longer to process. Consider reducing image dimensions before uploading very large images.',
        icon: <Clock className="h-5 w-5 text-antique-gold" />,
      });
    }
    
    // Add default recommendation if none generated
    if (recommendations.length === 0) {
      recommendations.push({
        title: 'Your optimization looks great!',
        description: 'Based on your analytics, you\'re already using optimal settings for your images.',
        icon: <ArrowUpRight className="h-5 w-5 text-success-green" />,
      });
    }
    
    return recommendations;
  };
  
  const recommendations = getRecommendations();
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Optimization Recommendations</CardTitle>
        <CardDescription>
          Suggestions to improve your image optimization workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="p-3 border border-border rounded-md flex gap-3 hover:border-kollect-blue/20 hover:bg-muted/10 transition-colors"
            >
              <div className="mt-0.5">
                {rec.icon}
              </div>
              <div>
                <h4 className="font-medium text-base mb-1">{rec.title}</h4>
                <p className="text-sm text-sage-gray">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationRecommendations;
