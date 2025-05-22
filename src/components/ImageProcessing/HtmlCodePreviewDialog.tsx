
import React from 'react';
import { ProcessedImage } from '@/types/imageProcessing';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HtmlCodePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ProcessedImage | null;
}

const HtmlCodePreviewDialog: React.FC<HtmlCodePreviewDialogProps> = ({ open, onOpenChange, image }) => {
  if (!image) return null;
  
  const getWordPressHtml = () => {
    const { original, processedFormats, wordpressType = 'image' } = image;
    const baseName = (image.newFilename || original.name).split('.')[0];
    
    // Create a WordPress-friendly filename
    const createWordPressFileName = (format: string) => {
      return `${baseName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format}`;
    };

    const generatePictureElement = () => {
      const hasAvif = processedFormats?.avif;
      const hasWebp = processedFormats?.webp;
      const hasJpeg = processedFormats?.jpeg;
      const imgSrc = hasJpeg ? createWordPressFileName('jpg') : 
                    hasWebp ? createWordPressFileName('webp') : 
                    hasAvif ? createWordPressFileName('avif') : '';
      
      let html = '<picture>\n';
      if (hasAvif) {
        html += `  <source srcset="${createWordPressFileName('avif')}" type="image/avif">\n`;
      }
      if (hasWebp) {
        html += `  <source srcset="${createWordPressFileName('webp')}" type="image/webp">\n`;
      }
      html += `  <img src="${imgSrc}" alt="Description" loading="lazy"`;
      
      if (image.dimensions) {
        html += ` width="${image.dimensions.width}" height="${image.dimensions.height}"`;
      }
      
      html += '>\n';
      html += '</picture>';
      
      return html;
    };

    const generateSchemaOrgData = () => {
      return `<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "ImageObject",
  "contentUrl": "${createWordPressFileName('jpg')}",
  "name": "${baseName}",
  "description": "Add a description here",
  ${image.dimensions ? `"width": "${image.dimensions.width}",\n  "height": "${image.dimensions.height}",` : ''}
  "encodingFormat": "${processedFormats?.jpeg ? 'image/jpeg' : processedFormats?.webp ? 'image/webp' : 'image/avif'}"
}
</script>`;
    };

    return {
      pictureElement: generatePictureElement(),
      schemaOrgData: generateSchemaOrgData(),
      cssSnippet: `/* Recommended CSS for WordPress images */
.wp-block-image img {
  height: auto; /* Maintain aspect ratio */
  max-width: 100%; /* Responsive images */
  object-fit: cover; /* Ensure images cover their container */
}

/* For featured images */
.featured-image img {
  aspect-ratio: 16 / 9; /* Maintain consistent aspect ratio */
  width: 100%;
}`,
      phpSnippet: `<?php
// Add this to your theme's functions.php to enable WebP and AVIF in WordPress
function add_webp_avif_upload_mimes($mimes) {
  $mimes['webp'] = 'image/webp';
  $mimes['avif'] = 'image/avif';
  return $mimes;
}
add_filter('upload_mimes', 'add_webp_avif_upload_mimes');

// Add responsive image markup
function enable_responsive_images() {
  add_theme_support('responsive-embeds');
  add_theme_support('html5', array('picture'));
}
add_action('after_setup_theme', 'enable_responsive_images');
?>`
    };
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const codeSnippets = image ? getWordPressHtml() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>WordPress HTML Code</DialogTitle>
          <DialogDescription>
            Copy and paste this code into your WordPress site
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Picture Element (Responsive Images)</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => codeSnippets && handleCopyToClipboard(codeSnippets.pictureElement)}
                className="h-7"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copy</span>
              </Button>
            </div>
            <pre className="bg-slate-50 p-3 rounded-md text-xs overflow-x-auto">
              {codeSnippets?.pictureElement}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Schema.org Structured Data</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => codeSnippets && handleCopyToClipboard(codeSnippets.schemaOrgData)}
                className="h-7"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copy</span>
              </Button>
            </div>
            <pre className="bg-slate-50 p-3 rounded-md text-xs overflow-x-auto">
              {codeSnippets?.schemaOrgData}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Recommended CSS</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => codeSnippets && handleCopyToClipboard(codeSnippets.cssSnippet)}
                className="h-7"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copy</span>
              </Button>
            </div>
            <pre className="bg-slate-50 p-3 rounded-md text-xs overflow-x-auto">
              {codeSnippets?.cssSnippet}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">WordPress PHP Integration</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => codeSnippets && handleCopyToClipboard(codeSnippets.phpSnippet)}
                className="h-7"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Copy</span>
              </Button>
            </div>
            <pre className="bg-slate-50 p-3 rounded-md text-xs overflow-x-auto">
              {codeSnippets?.phpSnippet}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HtmlCodePreviewDialog;
