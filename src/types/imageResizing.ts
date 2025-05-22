
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
export const WORDPRESS_SIZE_PRESETS: Record<string, { width: number; height?: number; crop: boolean }> = {
  'thumbnail': { width: 150, height: 150, crop: true },
  'medium': { width: 300, crop: false },
  'medium_large': { width: 768, crop: false },
  'large': { width: 1024, crop: false },
  'full': { width: 2048, crop: false },
};
