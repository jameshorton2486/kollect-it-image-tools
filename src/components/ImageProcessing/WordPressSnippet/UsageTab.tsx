
import React from 'react';

const UsageTab: React.FC = () => {
  return (
    <div className="text-sm space-y-4">
      <h3 className="font-medium text-base">How to Use in WordPress</h3>
      
      <div>
        <h4 className="font-medium mb-1">Using the HTML Block</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>In your WordPress post/page editor, add a new "Custom HTML" block</li>
          <li>Paste the copied HTML code into the block</li>
          <li>Preview your post/page to see the responsive image in action</li>
        </ol>
      </div>
      
      <div>
        <h4 className="font-medium mb-1">Using the Gutenberg Image Block</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Upload all image formats (AVIF, WebP, JPEG) to your Media Library</li>
          <li>Add an Image block to your page</li>
          <li>For advanced usage, convert the block to Custom HTML and paste the snippet</li>
        </ol>
      </div>
      
      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <h4 className="font-medium mb-1 text-blue-800">Browser Support</h4>
        <p>The <code>&lt;picture&gt;</code> element provides built-in fallbacks:</p>
        <ul className="list-disc pl-5 space-y-1 text-blue-700">
          <li>AVIF: ~79% of browsers (Chrome, Firefox, Opera)</li>
          <li>WebP: ~96% of browsers (almost universal support)</li>
          <li>JPEG: 100% of browsers (universal fallback)</li>
        </ul>
      </div>
    </div>
  );
};

export default UsageTab;
