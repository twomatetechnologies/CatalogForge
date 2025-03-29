import { 
  Business, 
  InsertBusiness, 
  Product, 
  InsertProduct, 
  Template, 
  InsertTemplate, 
  Catalog, 
  InsertCatalog 
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // Business operations
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinesses(): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  deleteBusiness(id: number): Promise<boolean>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(businessId?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  // Catalog operations
  getCatalog(id: number): Promise<Catalog | undefined>;
  getCatalogs(businessId?: number): Promise<Catalog[]>;
  createCatalog(catalog: InsertCatalog): Promise<Catalog>;
  updateCatalog(id: number, catalog: Partial<InsertCatalog>): Promise<Catalog | undefined>;
  deleteCatalog(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private businesses: Map<number, Business>;
  private products: Map<number, Product>;
  private templates: Map<number, Template>;
  private catalogs: Map<number, Catalog>;
  private currentBusinessId: number;
  private currentProductId: number;
  private currentTemplateId: number;
  private currentCatalogId: number;

  constructor() {
    this.businesses = new Map();
    this.products = new Map();
    this.templates = new Map();
    this.catalogs = new Map();
    this.currentBusinessId = 1;
    this.currentProductId = 1;
    this.currentTemplateId = 1;
    this.currentCatalogId = 1;

    // Initialize with some default templates
    this.initializeTemplates();
  }

  // Business methods
  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values());
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const id = this.currentBusinessId++;
    const newBusiness: Business = { ...business, id };
    this.businesses.set(id, newBusiness);
    return newBusiness;
  }

  async updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const existingBusiness = this.businesses.get(id);
    if (!existingBusiness) return undefined;

    const updatedBusiness = { ...existingBusiness, ...business };
    this.businesses.set(id, updatedBusiness);
    return updatedBusiness;
  }

  async deleteBusiness(id: number): Promise<boolean> {
    return this.businesses.delete(id);
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(businessId?: number): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    if (businessId !== undefined) {
      return allProducts.filter(product => product.businessId === businessId);
    }
    return allProducts;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id, 
      createdAt: now,
      updatedAt: now 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { 
      ...existingProduct, 
      ...product, 
      updatedAt: new Date() 
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Template methods
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const newTemplate: Template = { ...template, id };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined> {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) return undefined;

    const updatedTemplate = { ...existingTemplate, ...template };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Catalog methods
  async getCatalog(id: number): Promise<Catalog | undefined> {
    return this.catalogs.get(id);
  }

  async getCatalogs(businessId?: number): Promise<Catalog[]> {
    const allCatalogs = Array.from(this.catalogs.values());
    if (businessId !== undefined) {
      return allCatalogs.filter(catalog => catalog.businessId === businessId);
    }
    return allCatalogs;
  }

  async createCatalog(catalog: InsertCatalog): Promise<Catalog> {
    const id = this.currentCatalogId++;
    const now = new Date();
    const newCatalog: Catalog = { 
      ...catalog, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.catalogs.set(id, newCatalog);
    return newCatalog;
  }

  async updateCatalog(id: number, catalog: Partial<InsertCatalog>): Promise<Catalog | undefined> {
    const existingCatalog = this.catalogs.get(id);
    if (!existingCatalog) return undefined;

    const updatedCatalog = { 
      ...existingCatalog, 
      ...catalog, 
      updatedAt: new Date() 
    };
    this.catalogs.set(id, updatedCatalog);
    return updatedCatalog;
  }

  async deleteCatalog(id: number): Promise<boolean> {
    return this.catalogs.delete(id);
  }

  // Initialize with default templates
  private initializeTemplates() {
    const defaultTemplates: InsertTemplate[] = [
      {
        name: "Product Grid",
        description: "4x4 grid with product details",
        thumbnail: "/templates/product-grid.svg",
        layout: {
          type: "grid",
          columns: 2,
          rows: 2,
          showPrice: true,
          showSKU: true,
          showDescription: true
        },
        isDefault: true
      },
      {
        name: "Lookbook",
        description: "Featured product with description",
        thumbnail: "/templates/lookbook.svg",
        layout: {
          type: "featured",
          imagePosition: "left",
          showPrice: true,
          showDescription: true,
          showFeatures: true
        },
        isDefault: true
      },
      {
        name: "Price List",
        description: "Compact list with prices",
        thumbnail: "/templates/price-list.svg",
        layout: {
          type: "list",
          showImage: true,
          showPrice: true,
          showSKU: true,
          compact: true
        },
        isDefault: true
      },
      {
        name: "Feature Showcase",
        description: "Highlight product features",
        thumbnail: "/templates/feature-showcase.svg",
        layout: {
          type: "showcase",
          showImage: true,
          showBulletPoints: true,
          highlightFeatures: true
        },
        isDefault: true
      }
    ];

    defaultTemplates.forEach(template => {
      this.createTemplate(template);
    });
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
