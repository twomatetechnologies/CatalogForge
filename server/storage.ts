import { 
  Business, 
  InsertBusiness, 
  Product, 
  InsertProduct, 
  Template, 
  InsertTemplate, 
  Catalog, 
  InsertCatalog,
  User,
  InsertUser
} from "@shared/schema";
import { DEV_MODE, LOAD_SAMPLE_DATA } from '@shared/config';
import { sampleBusinesses, sampleProducts, sampleUsers } from './sampleData';

// Interface for settings types
export interface ProductLabelSettings {
  name: string;
  sku: string;
  price: string;
  description: string;
  size: string;
  piecesPerBox: string;
  stock: string;
  stockDate: string;
  barcode: string;
  category: string;
  tags: string;
  variations: string;
  active: string;
}

export interface AppSettings {
  product: ProductLabelSettings;
}

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserPassword(id: number, password: string): Promise<boolean>;
  updateUserResetToken(email: string, token: string, expiry: Date): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;

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
  
  // Settings operations
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businesses: Map<number, Business>;
  private products: Map<number, Product>;
  private templates: Map<number, Template>;
  private catalogs: Map<number, Catalog>;
  private settings: AppSettings;
  private currentUserId: number;
  private currentBusinessId: number;
  private currentProductId: number;
  private currentTemplateId: number;
  private currentCatalogId: number;

  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.products = new Map();
    this.templates = new Map();
    this.catalogs = new Map();
    this.currentUserId = 1;
    this.currentBusinessId = 1;
    this.currentProductId = 1;
    this.currentTemplateId = 1;
    this.currentCatalogId = 1;
    
    // Initialize default settings
    this.settings = {
      product: {
        name: "Product Name",
        sku: "SKU",
        price: "Price",
        description: "Description",
        size: "Size",
        piecesPerBox: "Pieces Per Box",
        stock: "Stock",
        stockDate: "Stock Date",
        barcode: "Barcode",
        category: "Category",
        tags: "Tags",
        variations: "Variations",
        active: "Active"
      }
    };

    // Initialize with some default templates
    this.initializeTemplates();

    // Load sample data if in development mode
    if (LOAD_SAMPLE_DATA) {
      this.loadSampleData();
    }
  }
  
  // Load sample data for development mode
  private loadSampleData() {
    console.log("Loading sample data for development mode...");
    
    // Add sample users
    sampleUsers.forEach(user => {
      this.createUser(user);
    });

    // Add sample businesses
    sampleBusinesses.forEach(business => {
      this.createBusiness(business);
    });
    
    // Add sample products
    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
    
    console.log(`Sample data loaded: ${sampleUsers.length} users, ${sampleBusinesses.length} businesses, ${sampleProducts.length} products`);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    
    // Set default role if not provided
    const role = user.role || 'user';
    
    const newUser: User = {
      ...user,
      id,
      role,
      resetToken: null,
      resetTokenExpiry: null,
      lastLogin: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { 
      ...existingUser, 
      ...user,
      updatedAt: new Date() 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(id: number, password: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    
    const updatedUser = {
      ...user,
      password,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return true;
  }

  async updateUserResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return false;

    const updatedUser = {
      ...user,
      resetToken: token,
      resetTokenExpiry: expiry,
      updatedAt: new Date()
    };
    
    this.users.set(user.id, updatedUser);
    return true;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
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
    
    // Ensure productIds is an array
    const productIds = catalog.productIds || [];
    
    // Create default settings if not provided
    const settings = catalog.settings || {
      pageSize: 'A4',
      orientation: 'portrait',
      showHeader: true,
      showFooter: true,
      showPageNumbers: true
    };
    
    const newCatalog: Catalog = { 
      ...catalog, 
      id,
      productIds,
      settings,
      pdfUrl: catalog.pdfUrl || null,
      createdAt: now, 
      updatedAt: now 
    };
    
    this.catalogs.set(id, newCatalog);
    return newCatalog;
  }

  async updateCatalog(id: number, catalog: Partial<InsertCatalog>): Promise<Catalog | undefined> {
    const existingCatalog = this.catalogs.get(id);
    if (!existingCatalog) return undefined;

    // Update settings by merging with existing settings
    const settings = catalog.settings 
      ? { ...existingCatalog.settings, ...catalog.settings }
      : existingCatalog.settings;
    
    // Ensure productIds is properly handled
    let productIds = existingCatalog.productIds;
    if (catalog.productIds) {
      // Convert to array if necessary
      productIds = Array.isArray(catalog.productIds) 
        ? catalog.productIds.slice() // create a copy to avoid reference issues
        : Array.from(catalog.productIds);
    }
      
    const updatedCatalog = { 
      ...existingCatalog, 
      ...catalog,
      productIds,
      settings,
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

  // Settings methods
  async getSettings(): Promise<AppSettings> {
    // Return a copy to avoid direct mutation
    return JSON.parse(JSON.stringify(this.settings));
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    // Deep merge settings
    if (settings.product) {
      this.settings.product = {
        ...this.settings.product,
        ...settings.product
      };
    }

    // Add other settings types here when needed
    
    // Return a copy of the updated settings
    return JSON.parse(JSON.stringify(this.settings));
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
