
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BatchProcessingProgressProps {
  isProcessing: boolean;
  batchProgress: number;
  processedItemsCount: number;
  totalItemsToProcess: number;
  onCancel: () => void;
}

const BatchProcessingProgress: React.FC<BatchProcessingProgressProps> = ({
  isProcessing,
  batchProgress,
  processedItemsCount,
  totalItemsToProcess,
  onCancel
}) => {
  if (!isProcessing || totalItemsToProcess === 0) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 border-brand-blue">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-sm font-medium flex items-center">
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Processing Images
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="mb-3">
          <Progress value={batchProgress} className="h-2" />
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Processing image {processedItemsCount} of {totalItemsToProcess}</span>
          <span>{batchProgress}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchProcessingProgress;
