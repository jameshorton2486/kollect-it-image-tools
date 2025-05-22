
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
  onCancel,
}) => {
  if (!isProcessing) return null;

  // Calculate estimated time remaining (dummy calculation)
  const estimatedTime = Math.max(1, Math.round((totalItemsToProcess - processedItemsCount) * 2));
  const estimatedTimeText = estimatedTime < 60 
    ? `${estimatedTime} seconds`
    : `${Math.floor(estimatedTime / 60)}:${(estimatedTime % 60).toString().padStart(2, '0')} minutes`;

  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-md z-50 px-4"
        >
          <Card className="shadow-lg border border-border">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-blue/20 p-1 rounded">
                    <ImageIcon className="h-4 w-4 text-brand-blue animate-pulse" />
                  </div>
                  <h4 className="text-sm font-medium">Processing Images</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={onCancel}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel</span>
                </Button>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{processedItemsCount} of {totalItemsToProcess}</span>
                </div>
                <Progress value={batchProgress} className="h-2" />
              </div>
              
              <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Estimated time remaining: {estimatedTimeText}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BatchProcessingProgress;
