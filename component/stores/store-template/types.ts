export interface TemplateProductItem {
  id: string;
  name: string;
  category: "jeans" | "jackets" | "shorts" | "tees";
  washKey: "raw" | "black" | "white" | string;
  tagline: string;
  badge?: string;
  price: string;
  compareAtPrice?: string;
  description: string;
  fabricSpec: string;
  fitSpec: string;
  careSpec: string;
  accentHex: string;
  modelPath: string; // 3D GLB file
  images: string[];
  sizes: string[];
}

export interface BrandStoreConfig {
  brandId: string;
  brandName: string;
  brandTagline: string;
  brandStory: string;
  originCity: string;
  foundedYear: string;
  accentColor: string; // e.g. #B9965A
  accentHoverColor: string;
  badgeText: string;
  isDemoMode: boolean;
  products: TemplateProductItem[];
}
