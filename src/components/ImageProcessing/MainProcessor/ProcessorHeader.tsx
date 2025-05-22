
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  UploadCloud, 
  Image, 
  RefreshCw, 
  Trash2, 
  Layers, 
  ArrowDown, 
  Download, 
  ZoomIn, 
  Book,
  FileCode, 
  CheckCheck
} from 'lucide-react';
import { ProcessedImage } from '@/types/imageProcessing';
import WordPressBatchExportDialog from '../WordPressBatchExportDialog';

interface ProcessorHeaderProps {
  onProcessAll: () => void;
  onDownloadAll: () => void;
  onSelectAll: (selected: boolean) => void;
  onReset: () => void;
  isProcessing: boolean;
  processedImages: ProcessedImage[];
  onAdditionalFilesUploaded?: (files: File[]) => void;
}

const ProcessorHeader: React.FC<ProcessorHeaderProps> = ({
  onProcessAll,
  onDownloadAll,
  onSelectAll,
  onReset,
  isProcessing,
  processedImages,
  onAdditionalFilesUploaded
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [batchExportOpen, setBatchExportOpen] = useState<boolean>(false);
  
  // Handle new files being added
  const handleFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onAdditionalFilesUploaded) {
      onAdditionalFilesUploaded(Array.from(files));
      e.target.value = ''; // Reset the input
    }
  };
  
  const handleSelectAction = (value: string) => {
    setSelectedAction(value);
    
    switch (value) {
      case 'select-all':
        onSelectAll(true);
        break;
      case 'select-none':
        onSelectAll(false);
        break;
      case 'export-html':
        setBatchExportOpen(true);
        break;
      default:
        break;
    }
    
    // Reset selection after action is performed
    setTimeout(() => setSelectedAction(''), 100);
  };
  
  const validImageCount = processedImages.filter(img => img.processed).length;
  
  return (
    <Card className="mb-4">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-semibold">Image Processor</h2>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{processedImages.length} image{processedImages.length !== 1 ? 's' : ''} loaded</span>
            {validImageCount > 0 && (
              <span className="ml-2">• {validImageCount} processed</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-3 px-4 border-t">
        <div className="flex flex-wrap items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onProcessAll} 
                  disabled={isProcessing || processedImages.length === 0} 
                  className="flex-none"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> 
                  {isProcessing ? 'Processing...' : 'Process All'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Process all loaded images</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={onDownloadAll} 
                  disabled={validImageCount === 0} 
                  className="flex-none"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download all processed images</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => setBatchExportOpen(true)}
                  disabled={validImageCount === 0} 
                  className="flex-none"
                >
                  <FileCode className="mr-2 h-4 w-4" />
                  HTML Snippets
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export WordPress HTML snippets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="ml-auto flex items-center gap-2">
            <Select value={selectedAction} onValueChange={handleSelectAction}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select-all">Select All</SelectItem>
                <SelectItem value="select-none">Select None</SelectItem>
                <SelectItem value="export-html">Export HTML Snippets</SelectItem>
              </SelectContent>
            </Select>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleFilesAdded}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isProcessing}
                    />
                    <Button 
                      variant="outline" 
                      className="flex-none"
                      disabled={isProcessing}
                      asChild
                    >
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Add Images
                      </label>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add more images to process</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onReset} 
                    className="flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear all images</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>

      <WordPressBatchExportDialog
        open={batchExportOpen}
        onOpenChange={setBatchExportOpen}
        processedImages={processedImages}
      />
    </Card>
  );
};

export default ProcessorHeader;
