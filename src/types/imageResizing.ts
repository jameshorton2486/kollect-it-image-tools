
/**
 * Possible modes for image resizing
 */
export type ResizeMode = 'fit' | 'fill' | 'crop' | 'scale';

/**
 * Units for image dimensions
 */
export type ResizeUnit = 'px' | '%';

/**
 * WordPress size presets
 */
export const WORDPRESS_SIZE_PRESETS: Record<string, { width: number; height?: number; crop: boolean; name: string }> = {
  'thumbnail': { width: 150, height: 150, crop: true, name: 'Thumbnail' },
  'medium': { width: 300, crop: false, name: 'Medium' },
  'medium_large': { width: 768, crop: false, name: 'Medium Large' },
  'large': { width: 1024, crop: false, name: 'Large' },
  'full': { width: 2048, crop: false, name: 'Full Size' },
};

/**
 * WordPress preset types for specialized use cases
 */
export const WORDPRESS_PRESET_TYPES = {
  productImages: { 
    name: "Product Images", 
    sizes: [
      { width: 300, height: 300 },
      { width: 600, height: 600 },
      { width: 1200, height: 1200 }
    ], 
    description: "Perfect for WooCommerce product galleries" 
  },
  heroBanners: { 
    name: "Hero Banners", 
    sizes: [
      { width: 1920, height: 1080 },
      { width: 1600, height: 900 },
      { width: 1200, height: 630 }
    ],
    description: "Large header images and banners" 
  },
  blogFeatured: { 
    name: "Blog Featured", 
    sizes: [
      { width: 1200, height: 630 },
      { width: 800, height: 450 },
      { width: 600, height: 400 }
    ],
    description: "Featured images for blog posts" 
  },
  logos: { 
    name: "Logos & Icons", 
    sizes: [
      { width: 512, height: 512 },
      { width: 256, height: 256 },
      { width: 128, height: 128 }
    ],
    description: "Company logos and site icons" 
  },
  gallery: { 
    name: "Gallery Images", 
    sizes: [
      { width: 800, height: 600 },
      { width: 600, height: 450 },
      { width: 400, height: 300 }
    ],
    description: "Image galleries and portfolios" 
  },
  backgrounds: { 
    name: "Background Images", 
    sizes: [
      { width: 1920, height: 1080 },
      { width: 1600, height: 900 }
    ],
    description: "Full-width background images" 
  }
};
