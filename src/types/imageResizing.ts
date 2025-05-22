
export interface ResizePreset {
  width: number;
  height: number;
  crop: boolean;
  name: string;
  description?: string;
}

export type ResizeMode = 'fit' | 'fill' | 'stretch' | 'crop';

export type ResizeUnit = 'px' | '%' | 'in' | 'cm';

export interface ResizeOptions {
  width: number;
  height: number;
  mode: ResizeMode;
  unit: ResizeUnit;
  quality: number;
  preserveAspectRatio: boolean;
  focusPoint?: {
    x: number;
    y: number;
  };
}

export const WORDPRESS_SIZE_PRESETS: Record<string, ResizePreset> = {
  thumbnail: { width: 150, height: 150, crop: true, name: "Thumbnail" },
  medium: { width: 300, height: 300, crop: false, name: "Medium" },
  medium_large: { width: 768, height: 0, crop: false, name: "Medium Large" },
  large: { width: 1024, height: 1024, crop: false, name: "Large" },
  full: { width: 0, height: 0, crop: false, name: "Full" },
  blog_featured: { width: 1200, height: 630, crop: true, name: "Blog Featured" },
  product_thumb: { width: 300, height: 300, crop: true, name: "Product Thumbnail" },
  hero_image: { width: 1920, height: 1080, crop: true, name: "Hero Image" }
};
