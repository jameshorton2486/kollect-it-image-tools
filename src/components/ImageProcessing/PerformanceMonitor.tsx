
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Activity, AlertTriangle, Cpu, MemoryStick } from "lucide-react";
import { getPerformanceStats, getMemoryUsage, detectPerformanceIssues } from "@/utils/performanceUtils";

interface PerformanceMonitorProps {
  isProcessing: boolean;
  isVisible: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isProcessing, isVisible }) => {
  const [stats, setStats] = useState<any>({});
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  
  // Update performance stats periodically
  useEffect(() => {
    if (!isVisible) return;
    
    const updateStats = () => {
      setStats(getPerformanceStats());
      setMemoryUsage(getMemoryUsage());
      setIssues(detectPerformanceIssues());
      
      // Simulate CPU usage (not actually available in browsers)
      if (isProcessing) {
        setCpuUsage(Math.min(100, cpuUsage + Math.random() * 10));
      } else {
        setCpuUsage(Math.max(0, cpuUsage - Math.random() * 10));
      }
    };
    
    // Update immediately
    updateStats();
    
    // Then update periodically
    const interval = setInterval(updateStats, 2000);
    
    return () => clearInterval(interval);
  }, [isVisible, isProcessing, cpuUsage]);
  
  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center">
          <Activity className="mr-2 h-4 w-4" />
          Performance Monitor
          {issues.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {issues.length} Issue{issues.length > 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        <div className="space-y-4">
          {/* Resource Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center">
                <Cpu className="h-3 w-3 mr-1" /> CPU Usage
              </span>
              <span>{cpuUsage.toFixed(0)}%</span>
            </div>
            <Progress value={cpuUsage} 
              className={`h-1.5 ${cpuUsage > 80 ? 'bg-red-100' : ''}`} />
              
            {memoryUsage && (
              <>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center">
                    <MemoryStick className="h-3 w-3 mr-1" /> Memory Usage
                  </span>
                  <span>
                    {memoryUsage.usedJSHeapSize ? 
                      `${(memoryUsage.usedJSHeapSize / (1024 * 1024)).toFixed(1)} MB / 
                       ${(memoryUsage.jsHeapSizeLimit / (1024 * 1024)).toFixed(0)} MB` : 
                      'Not available'}
                  </span>
                </div>
                {memoryUsage.usedJSHeapSize && (
                  <Progress 
                    value={(memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) * 100} 
                    className="h-1.5" 
                  />
                )}
              </>
            )}
          </div>
          
          {/* Performance Issues */}
          {issues.length > 0 && (
            <div className="space-y-2 p-2 bg-red-50 rounded-md">
              <div className="text-xs font-medium flex items-center text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Performance Issues Detected
              </div>
              <ul className="text-xs space-y-1 text-red-700">
                {issues.slice(0, 3).map((issue, i) => (
                  <li key={i}>{issue.message}</li>
                ))}
                {issues.length > 3 && (
                  <li>...and {issues.length - 3} more issues</li>
                )}
              </ul>
            </div>
          )}
          
          {/* Performance Statistics */}
          {Object.keys(stats).length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="stats">
                <AccordionTrigger className="text-xs py-2">
                  Processing Statistics
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 text-xs">
                    {Object.entries(stats).map(([operation, data]: [string, any]) => (
                      <div key={operation} className="grid grid-cols-2 gap-1">
                        <span>{operation}:</span>
                        <span>
                          {data.count} operations, avg {data.avgDuration.toFixed(0)}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
