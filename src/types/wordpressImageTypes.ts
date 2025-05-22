
export interface WordPressImageType {
  id: string;
  name: string;
  purpose: string;
  recommendedSize: string;
  recommendedWidth: number;
  recommendedHeight: number;
  format: string[];
  tips: string[];
}

export const WORDPRESS_IMAGE_TYPES: WordPressImageType[] = [
  {
    id: "logo",
    name: "Logo",
    purpose: "Brand identity on header, login, emails",
    recommendedSize: "250 x 100 px (or scalable SVG for best results)",
    recommendedWidth: 250,
    recommendedHeight: 100,
    format: [".SVG", ".PNG", ".JPG"],
    tips: [
      "Use a transparent background (.PNG or .SVG)",
      "Keep file size under 150 KB for speed",
      "Retina-ready: consider 2× version (500 x 200 px)"
    ]
  },
  {
    id: "favicon",
    name: "Favicon / Site Icon",
    purpose: "Browser tab icon",
    recommendedSize: "512 x 512 px",
    recommendedWidth: 512,
    recommendedHeight: 512,
    format: [".PNG", ".ICO", ".SVG"],
    tips: [
      "Use a simple design that's readable at 16x16 px",
      "WordPress automatically resizes this across devices"
    ]
  },
  {
    id: "product-main",
    name: "Product Main Image",
    purpose: "WooCommerce product display",
    recommendedSize: "800 x 800 px to 1200 x 1200 px",
    recommendedWidth: 1200,
    recommendedHeight: 1200,
    format: [".JPG", ".PNG"],
    tips: [
      "Square aspect ratio is best for consistency",
      "Use 2× size for retina (1600 x 1600 px)",
      "Compress images (TinyPNG or Smush)"
    ]
  },
  {
    id: "product-thumbnail",
    name: "Product Thumbnail",
    purpose: "WooCommerce product thumbnails",
    recommendedSize: "300 x 300 px",
    recommendedWidth: 300,
    recommendedHeight: 300,
    format: [".JPG", ".PNG"],
    tips: [
      "Keep uniform sizes for a clean shop grid"
    ]
  },
  {
    id: "hero",
    name: "Hero / Header Images",
    purpose: "Large banners at top of pages",
    recommendedSize: "1920 x 1080 px (Full HD)",
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    format: [".JPG", ".PNG", ".WEBP"],
    tips: [
      "Optimize for fast loading (keep under 300 KB)",
      "Use lazy loading if possible",
      "Use WEBP for better performance when supported"
    ]
  },
  {
    id: "blog-featured",
    name: "Blog Post Featured Images",
    purpose: "Featured images for blog posts",
    recommendedSize: "1200 x 675 px (16:9 aspect ratio)",
    recommendedWidth: 1200,
    recommendedHeight: 675,
    format: [".JPG", ".WEBP"],
    tips: [
      "Make them visually engaging",
      "Use consistent sizes for grid layouts"
    ]
  },
  {
    id: "background",
    name: "Background Images",
    purpose: "Full-width sections or parallax",
    recommendedSize: "1920 x 1080 px or 2560 x 1440 px",
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    format: [".JPG", ".WEBP"],
    tips: [
      "Use subtle textures or blurred photos",
      "Optimize aggressively for loading speed"
    ]
  },
  {
    id: "icons",
    name: "Icons & UI Graphics",
    purpose: "User interface elements",
    recommendedSize: "50 x 50 px to 100 x 100 px",
    recommendedWidth: 100,
    recommendedHeight: 100,
    format: [".SVG"],
    tips: [
      "Use SVG for clarity and responsiveness",
      "Use inline SVG for style control with CSS"
    ]
  },
  {
    id: "gallery",
    name: "Gallery Images",
    purpose: "Image gallery display",
    recommendedSize: "800 x 600 px or square 1024 x 1024 px",
    recommendedWidth: 1024,
    recommendedHeight: 1024,
    format: [".JPG", ".WEBP"],
    tips: [
      "Uniform size across galleries improves layout",
      "Enable lightbox functionality for larger views"
    ]
  },
  {
    id: "social",
    name: "Social Sharing Images",
    purpose: "Displayed when sharing links on social media",
    recommendedSize: "1200 x 630 px",
    recommendedWidth: 1200,
    recommendedHeight: 630,
    format: [".JPG", ".WEBP"],
    tips: [
      "Add via SEO plugin (Yoast, Rank Math)",
      "Make them click-worthy with clear visuals/text"
    ]
  },
  {
    id: "profile",
    name: "Testimonials / Profile Photos",
    purpose: "User avatars and testimonial images",
    recommendedSize: "150 x 150 px or 300 x 300 px",
    recommendedWidth: 300,
    recommendedHeight: 300,
    format: [".JPG", ".PNG"],
    tips: [
      "Crop as circles if used in sliders",
      "Optimize for retina (2× size)"
    ]
  }
];
