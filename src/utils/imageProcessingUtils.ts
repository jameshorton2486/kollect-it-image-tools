
// This file is now a simple re-export to maintain API compatibility
// while splitting the implementation into smaller files
export { processSingleImage, handleBackgroundRemoval, handleCompression } from './imageProcessing/processingCore';
export { initializeProcessedImages, downloadProcessedImage } from './imageProcessing/processingHelpers';
export { 
  processSingleImageInMultipleFormats,
  estimateImageSizes,
  convertToFormat
} from './imageProcessing/multiFormatProcessing';

