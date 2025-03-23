import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage as dataStorage } from "./storage";
import { 
  insertBusinessSchema, 
  insertProductSchema, 
  insertTemplateSchema, 
  insertCatalogSchema 
} from "@shared/schema";
import { z } from "zod";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Business Routes
  app.get("/api/businesses", async (_req, res) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const business = await storage.getBusiness(id);
      
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.post("/api/businesses", async (req, res) => {
    try {
      const validation = insertBusinessSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid business data", 
          errors: validation.error.format() 
        });
      }
      
      const business = await storage.createBusiness(validation.data);
      res.status(201).json(business);
    } catch (error) {
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  app.put("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertBusinessSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid business data", 
          errors: validation.error.format() 
        });
      }
      
      const updatedBusiness = await storage.updateBusiness(id, validation.data);
      
      if (!updatedBusiness) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(updatedBusiness);
    } catch (error) {
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  app.delete("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBusiness(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete business" });
    }
  });

  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      const businessId = req.query.businessId ? 
        parseInt(req.query.businessId as string) : 
        undefined;
      
      const products = await storage.getProducts(businessId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: validation.error.format() 
        });
      }
      
      const product = await storage.createProduct(validation.data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertProductSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: validation.error.format() 
        });
      }
      
      const updatedProduct = await storage.updateProduct(id, validation.data);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Template Routes
  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validation = insertTemplateSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid template data", 
          errors: validation.error.format() 
        });
      }
      
      const template = await storage.createTemplate(validation.data);
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertTemplateSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid template data", 
          errors: validation.error.format() 
        });
      }
      
      const updatedTemplate = await storage.updateTemplate(id, validation.data);
      
      if (!updatedTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(updatedTemplate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTemplate(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Catalog Routes
  app.get("/api/catalogs", async (req, res) => {
    try {
      const businessId = req.query.businessId ? 
        parseInt(req.query.businessId as string) : 
        undefined;
      
      const catalogs = await storage.getCatalogs(businessId);
      res.json(catalogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch catalogs" });
    }
  });

  app.get("/api/catalogs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const catalog = await storage.getCatalog(id);
      
      if (!catalog) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      
      res.json(catalog);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch catalog" });
    }
  });

  app.post("/api/catalogs", async (req, res) => {
    try {
      const validation = insertCatalogSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid catalog data", 
          errors: validation.error.format() 
        });
      }
      
      const catalog = await storage.createCatalog(validation.data);
      res.status(201).json(catalog);
    } catch (error) {
      res.status(500).json({ message: "Failed to create catalog" });
    }
  });

  app.put("/api/catalogs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertCatalogSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid catalog data", 
          errors: validation.error.format() 
        });
      }
      
      const updatedCatalog = await storage.updateCatalog(id, validation.data);
      
      if (!updatedCatalog) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      
      res.json(updatedCatalog);
    } catch (error) {
      res.status(500).json({ message: "Failed to update catalog" });
    }
  });

  app.delete("/api/catalogs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCatalog(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete catalog" });
    }
  });

  // File upload for product images
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return the path to the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;
      
      res.json({ 
        url: imageUrl,
        success: true 
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Import products from CSV/JSON
  app.post("/api/import/products", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const businessId = req.body.businessId ? 
        parseInt(req.body.businessId) : 
        undefined;

      if (!businessId) {
        return res.status(400).json({ message: "Business ID is required" });
      }

      // Read file content from disk
      const filePath = req.file.path;
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileType = path.extname(req.file.originalname).toLowerCase();
      
      let products = [];
      
      if (fileType === '.json') {
        try {
          const parsed = JSON.parse(fileContent);
          products = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          return res.status(400).json({ message: "Invalid JSON file" });
        }
      } else if (fileType === '.csv') {
        // In a real app we would parse CSV
        return res.status(400).json({ message: "CSV import is not implemented in this prototype" });
      } else {
        return res.status(400).json({ message: "Unsupported file type" });
      }

      // Validate products
      const productSchema = insertProductSchema.extend({
        businessId: z.number().optional(),
      });

      const validatedProducts = [];
      for (const product of products) {
        const validation = productSchema.safeParse({
          ...product,
          businessId: businessId
        });
        
        if (validation.success) {
          validatedProducts.push(validation.data);
        }
      }

      // Import the products
      const importedProducts = [];
      for (const product of validatedProducts) {
        const importedProduct = await storage.createProduct(product);
        importedProducts.push(importedProduct);
      }

      res.status(201).json({
        message: `Successfully imported ${importedProducts.length} products`,
        products: importedProducts
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to import products" });
    }
  });

  // Generate PDF from catalog
  app.get("/api/catalogs/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const catalog = await storage.getCatalog(id);
      
      if (!catalog) {
        return res.status(404).json({ message: "Catalog not found" });
      }

      // In a real implementation we would generate the PDF here
      // For this prototype, we'll just return the catalog
      res.json({
        message: "PDF generation is simulated in this prototype",
        catalog
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const businesses = await storage.getBusinesses();
      const products = await storage.getProducts();
      const catalogs = await storage.getCatalogs();
      const templates = await storage.getTemplates();
      
      res.json({
        totalBusinesses: businesses.length,
        totalProducts: products.length,
        totalCatalogs: catalogs.length,
        totalTemplates: templates.length,
        activeProducts: products.filter(p => p.active).length,
        totalDownloads: 0 // Placeholder for demo
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  return httpServer;
}
