import { Business, Product, InsertBusiness, InsertProduct } from '@shared/schema';
import { DEFAULT_BUSINESS_ID } from '@shared/config';

export const sampleBusinesses: InsertBusiness[] = [
  {
    name: "Sample Company",
    logo: null,
    description: "A sample company for development purposes",
    address: "123 Sample Street, Sample City, 12345",
    contactEmail: "contact@samplecompany.com",
    contactPhone: "+1 (123) 456-7890",
    settings: {
      defaultTemplateId: 1,
      theme: {
        primary: "#3366FF",
        secondary: "#FF6633"
      },
      pdfSettings: {
        defaultSize: "A4",
        defaultOrientation: "portrait"
      }
    }
  },
  {
    name: "Test Corporation",
    logo: null,
    description: "A test corporation for development purposes",
    address: "456 Test Avenue, Test Town, 67890",
    contactEmail: "info@testcorp.com",
    contactPhone: "+1 (987) 654-3210",
    settings: {
      defaultTemplateId: 2,
      theme: {
        primary: "#22CCAA",
        secondary: "#AA22CC"
      },
      pdfSettings: {
        defaultSize: "Letter",
        defaultOrientation: "landscape"
      }
    }
  }
];

export const sampleProducts: InsertProduct[] = [
  {
    businessId: DEFAULT_BUSINESS_ID,
    name: "Premium Widget",
    sku: "W-PREMIUM-001",
    description: "High-quality premium widget with advanced features",
    price: "99.99",
    category: "Widgets",
    tags: ["premium", "featured", "bestseller"],
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"],
    variations: [
      {
        name: "Color",
        options: ["Red", "Blue", "Green"]
      },
      {
        name: "Size",
        options: ["Small", "Medium", "Large"]
      }
    ],
    active: true
  },
  {
    businessId: DEFAULT_BUSINESS_ID,
    name: "Basic Gadget",
    sku: "G-BASIC-002",
    description: "Affordable basic gadget for everyday use",
    price: "49.99",
    category: "Gadgets",
    tags: ["basic", "affordable", "popular"],
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12"],
    variations: [
      {
        name: "Color",
        options: ["Black", "White", "Silver"]
      }
    ],
    active: true
  },
  {
    businessId: DEFAULT_BUSINESS_ID,
    name: "Deluxe Accessory",
    sku: "A-DELUXE-003",
    description: "Deluxe accessory with premium materials",
    price: "79.99",
    category: "Accessories",
    tags: ["deluxe", "premium", "gift"],
    images: ["https://images.unsplash.com/photo-1560343090-f0409e92791a"],
    variations: [],
    active: true
  },
  {
    businessId: DEFAULT_BUSINESS_ID,
    name: "Economy Tool Kit",
    sku: "T-ECON-004",
    description: "Essential tool kit for home repairs",
    price: "39.99",
    category: "Tools",
    tags: ["economy", "essential", "toolkit"],
    images: ["https://images.unsplash.com/photo-1581235720704-06d3acfcb36f"],
    variations: [],
    active: true
  },
  {
    businessId: DEFAULT_BUSINESS_ID,
    name: "Professional System",
    sku: "S-PRO-005",
    description: "Professional system for business applications",
    price: "299.99",
    category: "Systems",
    tags: ["professional", "business", "advanced"],
    images: ["https://images.unsplash.com/photo-1601524909162-ae8725290836"],
    variations: [
      {
        name: "Capacity",
        options: ["Standard", "Enhanced", "Ultimate"]
      }
    ],
    active: false
  }
];