// User type for authentication (simplified for this prototype)
export interface User {
  id: number;
  name: string;
  email: string;
}

// Business profile-related types
export interface BusinessProfile {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  settings?: BusinessSettings;
}

export interface BusinessSettings {
  defaultTemplateId?: number;
  theme?: {
    primary: string;
    secondary: string;
  };
  pdfSettings?: {
    defaultSize: string;
    defaultOrientation: 'portrait' | 'landscape';
  };
}

// Product-related types
export interface Product {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  sku?: string;
  price?: string;
  images?: string[];
  category?: string;
  tags?: string[];
  variations?: ProductVariation[];
  active: boolean;
}

export interface ProductVariation {
  name: string;
  options: string[];
}

// Template-related types
export interface Template {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  layout: TemplateLayout;
  isDefault: boolean;
}

export interface TemplateLayout {
  type: 'grid' | 'featured' | 'list' | 'showcase';
  columns?: number;
  rows?: number;
  showPrice?: boolean;
  showSKU?: boolean;
  showDescription?: boolean;
  showImage?: boolean;
  showFeatures?: boolean;
  showBulletPoints?: boolean;
  highlightFeatures?: boolean;
  imagePosition?: 'left' | 'right' | 'top';
  compact?: boolean;
}

// Catalog-related types
export interface Catalog {
  id: number;
  businessId: number;
  name: string;
  description?: string;
  status: 'draft' | 'published';
  templateId: number;
  content: CatalogContent;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CatalogContent {
  pages: CatalogPage[];
  settings: CatalogSettings;
}

export interface CatalogPage {
  id: string;
  items: CatalogItem[];
  layout: string;
}

export interface CatalogItem {
  id: string;
  type: 'product' | 'text' | 'image';
  content: any;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface CatalogSettings {
  pageSize: string;
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  showHeader: boolean;
  showFooter: boolean;
  headerContent?: string;
  footerContent?: string;
  backgroundColor: string;
}

// Dashboard stats type
export interface DashboardStats {
  totalCatalogs: number;
  activeProducts: number;
  totalDownloads: number;
}

// For drag and drop functionality
export interface DragItem {
  id: string;
  type: string;
  data: any;
}
