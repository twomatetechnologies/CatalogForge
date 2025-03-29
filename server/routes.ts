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
      const businesses = await dataStorage.getBusinesses();
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const business = await dataStorage.getBusiness(id);
      
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
      
      const business = await dataStorage.createBusiness(validation.data);
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
      
      const updatedBusiness = await dataStorage.updateBusiness(id, validation.data);
      
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
      const deleted = await dataStorage.deleteBusiness(id);
      
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
      
      const products = await dataStorage.getProducts(businessId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await dataStorage.getProduct(id);
      
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
      
      const product = await dataStorage.createProduct(validation.data);
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
      
      const updatedProduct = await dataStorage.updateProduct(id, validation.data);
      
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
      const deleted = await dataStorage.deleteProduct(id);
      
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
      const templates = await dataStorage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await dataStorage.getTemplate(id);
      
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
      
      const template = await dataStorage.createTemplate(validation.data);
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
      
      const updatedTemplate = await dataStorage.updateTemplate(id, validation.data);
      
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
      const deleted = await dataStorage.deleteTemplate(id);
      
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
      
      const catalogs = await dataStorage.getCatalogs(businessId);
      res.json(catalogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch catalogs" });
    }
  });

  app.get("/api/catalogs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const catalog = await dataStorage.getCatalog(id);
      
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
      
      const catalog = await dataStorage.createCatalog(validation.data);
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
      
      const updatedCatalog = await dataStorage.updateCatalog(id, validation.data);
      
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
      const deleted = await dataStorage.deleteCatalog(id);
      
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
        try {
          const lines = fileContent.split('\n');
          
          if (lines.length < 2) {
            return res.status(400).json({ message: "CSV file must have a header row and at least one data row" });
          }
          
          // Parse the header row to determine column positions
          const header = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          // Get column indexes
          const nameIndex = header.indexOf('name');
          const descriptionIndex = header.indexOf('description');
          const skuIndex = header.indexOf('sku');
          const priceIndex = header.indexOf('price');
          const categoryIndex = header.indexOf('category');
          const tagsIndex = header.indexOf('tags');
          const activeIndex = header.indexOf('active');
          
          // Validate required columns
          if (nameIndex === -1) {
            return res.status(400).json({ message: "CSV file must contain a 'name' column" });
          }
          
          // Process each row (skip header)
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            // Split the line and respect quoted values
            const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
            
            if (row.length < header.length) continue;
            
            // Create a product object
            const product: any = {
              businessId: businessId,
              name: nameIndex >= 0 ? row[nameIndex] : '',
              active: true // Default to active
            };
            
            // Add optional fields if available
            if (descriptionIndex >= 0) product.description = row[descriptionIndex];
            if (skuIndex >= 0) product.sku = row[skuIndex];
            if (priceIndex >= 0) product.price = row[priceIndex];
            if (categoryIndex >= 0) product.category = row[categoryIndex];
            
            // Process tags - use semicolons as delimiters inside CSV field
            if (tagsIndex >= 0 && row[tagsIndex]) {
              product.tags = row[tagsIndex].split(';').map(tag => tag.trim());
            }
            
            // Process active status
            if (activeIndex >= 0) {
              const activeValue = row[activeIndex].toLowerCase();
              product.active = !(activeValue === 'false' || activeValue === 'no' || activeValue === '0');
            }
            
            // Validate required fields
            if (product.name && product.name.trim() !== '') {
              products.push(product);
            }
          }
          
        } catch (e: any) {
          return res.status(400).json({ message: `CSV parsing error: ${e.message}` });
        }
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
        const importedProduct = await dataStorage.createProduct(product);
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
      console.log(`Generating PDF for catalog ID: ${req.params.id}`);
      const id = parseInt(req.params.id);
      const catalog = await dataStorage.getCatalog(id);
      
      if (!catalog) {
        console.log(`Catalog not found: ${id}`);
        return res.status(404).json({ message: "Catalog not found" });
      }
      
      console.log(`Found catalog: ${catalog.name}`);
      
      // Get the template used by this catalog
      const template = await dataStorage.getTemplate(catalog.templateId);
      if (!template) {
        console.log(`Template not found: ${catalog.templateId}`);
        return res.status(404).json({ message: "Template not found" });
      }
      
      console.log(`Using template: ${template.name}`);
      
      // Get the business info
      const business = await dataStorage.getBusiness(catalog.businessId);
      if (!business) {
        console.log(`Business not found: ${catalog.businessId}`);
        return res.status(404).json({ message: "Business not found" });
      }
      
      console.log(`Business: ${business.name}`);
      
      // Get all products included in this catalog
      const allProducts = await dataStorage.getProducts(catalog.businessId);
      console.log(`Found ${allProducts.length} products for business`);
      
      // Ensure productIds is an array
      if (!Array.isArray(catalog.productIds)) {
        console.log('Product IDs is not an array:', catalog.productIds);
        catalog.productIds = [];
      }
      
      const catalogProducts = allProducts.filter(product => 
        catalog.productIds.includes(product.id)
      );
      console.log(`${catalogProducts.length} products included in catalog`);
      
      // First, import our PDF generator
      const { generatePDF } = await import('./pdfGenerator');
      
      // Create paths for the generated files
      const generatedDir = path.join(process.cwd(), 'public', 'generated');
      console.log(`Generated directory path: ${generatedDir}`);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(generatedDir)) {
        console.log('Creating generated directory');
        fs.mkdirSync(generatedDir, { recursive: true });
      }
      
      // Create file names for both HTML and PDF
      const timestamp = Date.now();
      const fileBaseName = `catalog_${catalog.id}_${timestamp}`;
      const htmlFileName = `${fileBaseName}.html`;
      const pdfFileName = `${fileBaseName}.pdf`;
      const htmlPath = path.join(generatedDir, htmlFileName);
      const pdfPath = path.join(generatedDir, pdfFileName);
      
      console.log(`HTML path: ${htmlPath}`);
      console.log(`PDF path: ${pdfPath}`);
      
      // Generate HTML content for catalog
      let productHtml = '';
      for (const product of catalogProducts) {
        let imageHtml = 'No Image';
        if (product.images && product.images[0]) {
          imageHtml = `<img src="${product.images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">`;
        }
        
        let skuHtml = '';
        if (product.sku) {
          skuHtml = `<div class="product-sku">SKU: ${product.sku}</div>`;
        }
        
        let priceHtml = '';
        if (product.price) {
          priceHtml = `<div class="product-price">$${product.price}</div>`;
        }
        
        let descriptionHtml = '';
        if (product.description) {
          descriptionHtml = `<div class="product-description">${product.description}</div>`;
        }
        
        productHtml += `
          <div class="product">
            <div class="product-image">
              ${imageHtml}
            </div>
            <div class="product-details">
              <div class="product-name">${product.name}</div>
              ${skuHtml}
              ${priceHtml}
              ${descriptionHtml}
            </div>
          </div>
        `;
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${catalog.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .product { border: 1px solid #eee; padding: 15px; margin-bottom: 15px; display: flex; }
            .product-image { width: 100px; height: 100px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
            .product-details { flex: 1; }
            .product-name { font-weight: bold; margin-bottom: 5px; }
            .product-price { color: #e63946; font-weight: bold; }
            .product-description { color: #666; margin-top: 5px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${catalog.name}</h1>
            <p>${catalog.description || ''}</p>
            <p>Template: ${template.name}</p>
          </div>
          
          <div class="products">
            ${productHtml}
          </div>
          
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>${business.name}</p>
          </div>
        </body>
        </html>
      `;
      
      console.log('Writing HTML content to file');
      fs.writeFileSync(htmlPath, htmlContent);
      console.log('HTML file written successfully');
      
      // Set the HTML URL for preview (will be used if PDF generation fails)
      const htmlUrl = `/generated/${htmlFileName}`;
      
      try {
        // Import our PDFKit generator
        const { generateCatalogPDF } = await import('./pdfKitGenerator');
        
        // Generate actual PDF using PDFKit
        console.log('Generating PDF with PDFKit...');
        await generateCatalogPDF(
          catalog,
          catalogProducts,
          template,
          business,
          pdfPath
        );
        
        // Set the PDF URL
        const pdfUrl = `/generated/${pdfFileName}`;
        console.log(`PDF URL: ${pdfUrl}`);
        
        // Update the catalog with both HTML and PDF URLs
        const updatedCatalog = await dataStorage.updateCatalog(catalog.id, {
          pdfUrl: pdfUrl,
          status: 'published'
        });
        console.log('Catalog updated with PDF URL');
        
        res.json({
          message: "PDF generated successfully",
          pdfUrl: pdfUrl,
          htmlUrl: htmlUrl,
          catalog: updatedCatalog,
          productCount: catalogProducts.length
        });
      } catch (pdfError) {
        console.error('Error generating PDF, falling back to HTML:', pdfError);
        
        // Update the catalog with HTML URL as fallback
        const updatedCatalog = await dataStorage.updateCatalog(catalog.id, {
          pdfUrl: htmlUrl,
          status: 'published'
        });
        
        // Return the HTML version as fallback
        res.json({
          message: "Catalog generated as HTML (PDF generation failed)",
          pdfUrl: htmlUrl, // Use HTML as fallback
          htmlUrl: htmlUrl,
          catalog: updatedCatalog,
          productCount: catalogProducts.length,
          error: "PDF generation failed, using HTML version instead"
        });
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const businesses = await dataStorage.getBusinesses();
      const products = await dataStorage.getProducts();
      const catalogs = await dataStorage.getCatalogs();
      const templates = await dataStorage.getTemplates();
      
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
