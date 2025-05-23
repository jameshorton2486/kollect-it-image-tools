
import React from 'react';
import { ProcessedImage, WordPressPreset } from '@/types/imageProcessing';
import WordPressImageOptions from '../WordPressImageOptions';
import WordPressPresetsSection from '../WordPressPresetsSection';
import EcommercePresetsSection from '../EcommercePresetsSection';

interface ProcessorSidebarProps {
  processedImages: ProcessedImage[];
  applyWordPressType: (imageIndex: number, typeId: string) => void;
  applyBulkWordPressType: (typeId: string) => void;
  renameImage: (imageIndex: number, newName: string) => void;
  setImageOutputFormat: (imageIndex: number, format: string) => void;
  exportPath: string;
  setExportPath: (path: string) => void;
  applyWordPressPreset: (preset: WordPressPreset) => void;
  setMaxWidth: (value: number) => void;
  setMaxHeight: (value: number) => void;
}

const ProcessorSidebar: React.FC<ProcessorSidebarProps> = ({
  processedImages,
  applyWordPressType,
  applyBulkWordPressType,
  renameImage,
  setImageOutputFormat,
  exportPath,
  setExportPath,
  applyWordPressPreset,
  setMaxWidth,
  setMaxHeight
}) => {
  return (
    <div className="col-span-1 space-y-4">
      <WordPressImageOptions
        processedImages={processedImages}
        onApplyWordPressType={applyWordPressType}
        onApplyBulkWordPressType={applyBulkWordPressType}
        onRenameImage={renameImage}
        onSetOutputFormat={setImageOutputFormat}
        onSetExportPath={setExportPath}
        exportPath={exportPath}
      />
      
      <WordPressPresetsSection
        onApplyPreset={applyWordPressPreset}
      />
      
      <EcommercePresetsSection
        onApplyPreset={(width, height) => {
          setMaxWidth(width);
          setMaxHeight(height);
        }}
      />
    </div>
  );
};

export default ProcessorSidebar;
