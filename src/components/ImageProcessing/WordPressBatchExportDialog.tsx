
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessedImage } from '@/types/imageProcessing';
import { exportAllWordPressSnippets } from '@/utils/imageProcessing/wordPressSnippets';
import { saveHtmlPreview } from '@/utils/googleDriveUtils';
import { Package, FileCode, Save, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface WordPressBatchExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processedImages: ProcessedImage[];
}

const WordPressBatchExportDialog: React.FC<WordPressBatchExportDialogProps> = ({
  open,
  onOpenChange,
  processedImages
}) => {
  const [includeSchema, setIncludeSchema] = useState<boolean>(true);
  const [includeOriginals, setIncludeOriginals] = useState<boolean>(true);
  const [includePreviews, setIncludePreviews] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  // Count how many valid processed images we have
  const validImageCount = processedImages.filter(img => img.processed && img.productId).length;
  const imagesWithMultipleFormats = processedImages.filter(img => 
    img.processed && img.processedFormats && Object.keys(img.processedFormats).length > 0
  ).length;
  
  const handleExport = async () => {
    if (validImageCount === 0) {
      toast.error('No processed images available to export');
      return;
    }
    
    try {
      setExporting(true);
      setProgress(10);
      
      // Export all WordPress snippets as a ZIP file
      await exportAllWordPressSnippets(processedImages);
      
      setProgress(100);
      toast.success('WordPress snippets exported successfully');
      
      // Close dialog after short delay
      setTimeout(() => {
        onOpenChange(false);
        setExporting(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error during export:', error);
      toast.error('Failed to export WordPress snippets');
      setExporting(false);
      setProgress(0);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export WordPress HTML Snippets</DialogTitle>
          <DialogDescription>
            Generate and export HTML snippets for all processed images
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Export Summary</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Total Images: {processedImages.length}</li>
              <li>• Processed Images: {validImageCount}</li>
              <li>• Images with Multiple Formats: {imagesWithMultipleFormats}</li>
            </ul>
          </div>
          
          <Tabs defaultValue="export">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="export">Export Options</TabsTrigger>
              <TabsTrigger value="about">About WordPress Integration</TabsTrigger>
            </TabsList>
            <TabsContent value="export" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="schema" 
                    checked={includeSchema}
                    onCheckedChange={(checked) => setIncludeSchema(checked as boolean)}
                  />
                  <Label htmlFor="schema">Include schema.org structured data</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="originals" 
                    checked={includeOriginals}
                    onCheckedChange={(checked) => setIncludeOriginals(checked as boolean)}
                  />
                  <Label htmlFor="originals">Include original images in ZIP</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="previews" 
                    checked={includePreviews}
                    onCheckedChange={(checked) => setIncludePreviews(checked as boolean)}
                  />
                  <Label htmlFor="previews">Include HTML previews</Label>
                </div>
              </div>
              
              {exporting && (
                <div className="space-y-2">
                  <Label>Exporting... {progress}%</Label>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </TabsContent>
            <TabsContent value="about" className="text-sm space-y-3">
              <h3 className="font-medium">Using Images in WordPress</h3>
              <p>
                This feature generates HTML code snippets that leverage modern image formats 
                (AVIF, WebP) with automatic fallbacks for older browsers.
              </p>
              
              <div className="border-l-2 border-blue-500 pl-3 text-sm">
                <p className="font-medium text-blue-700">Why use these snippets?</p>
                <p className="text-blue-600">
                  They provide optimal performance with appropriate fallbacks, ensuring
                  your website loads quickly while supporting all browsers.
                </p>
              </div>
              
              <h4 className="font-medium mt-2">How to Use</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Export the HTML snippets</li>
                <li>Upload the image files to your WordPress media library</li>
                <li>Add a Custom HTML block to your page</li>
                <li>Paste the appropriate HTML snippet</li>
                <li>Publish your page</li>
              </ol>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting || validImageCount === 0}>
            {exporting ? (
              <>
                <Package className="mr-2 h-4 w-4 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <FileCode className="mr-2 h-4 w-4" />
                Export {validImageCount} HTML Snippet{validImageCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WordPressBatchExportDialog;
