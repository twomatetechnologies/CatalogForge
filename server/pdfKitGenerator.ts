import fs from 'fs';
import path from 'path';
// Try-catch block for PDFKit import to gracefully handle missing dependencies
let PDFDocument: any;
try {
  PDFDocument = require('pdfkit');
  console.log('PDFKit loaded successfully');
} catch (error) {
  console.error('Error loading PDFKit:', error);
  PDFDocument = null;
}

/**
 * Generates a PDF file using PDFKit
 * @param outputPath The path where the PDF file should be saved
 * @param options Additional PDF generation options
 * @param renderFunction A function that receives the PDFKit document to render content
 * @returns The path to the generated PDF file
 */
export async function generatePDFWithPDFKit(
  outputPath: string,
  options: {
    format?: 'A4' | 'Letter' | 'Legal';
    orientation?: 'portrait' | 'landscape';
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    info?: {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string;
    };
  } = {},
  renderFunction: (doc: any) => void
): Promise<string> {
  // Check if PDFKit is available
  if (!PDFDocument) {
    console.error('PDFKit is not available. PDF generation failed.');
    throw new Error('PDFKit is not available. Please check if the required dependencies are installed.');
  }

  try {
    console.log('Starting PDF generation with PDFKit');
    
    // Set default options
    const format = options.format || 'A4';
    const orientation = options.orientation || 'portrait';
    const margin = options.margin || {
      top: 72,
      right: 72,
      bottom: 72,
      left: 72,
    };
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Define page dimensions based on format
    let pageWidth, pageHeight;
    switch (format) {
      case 'A4':
        pageWidth = 595.28;
        pageHeight = 841.89;
        break;
      case 'Letter':
        pageWidth = 612;
        pageHeight = 792;
        break;
      case 'Legal':
        pageWidth = 612;
        pageHeight = 1008;
        break;
      default:
        pageWidth = 595.28;
        pageHeight = 841.89;
    }
    
    // Swap dimensions for landscape orientation
    if (orientation === 'landscape') {
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }
    
    // Create the PDF document
    const doc = new PDFDocument({
      size: [pageWidth, pageHeight],
      margins: margin,
      info: options.info,
    });
    
    // Pipe the PDF to a file
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);
    
    // Execute the render function to add content to the PDF
    renderFunction(doc);
    
    // Finalize the PDF and end the stream
    doc.end();
    
    // Return a promise that resolves when the file is written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log(`PDF generated successfully at: ${outputPath}`);
        resolve(outputPath);
      });
      
      writeStream.on('error', (error) => {
        console.error('Error writing PDF file:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Generates a PDF file from catalog data
 * @param catalog The catalog data
 * @param products List of products to include in the catalog
 * @param template Template information
 * @param business Business information
 * @param outputPath Path where to save the PDF
 * @param options PDF generation options
 * @returns Path to the generated PDF
 */
export async function generateCatalogPDF(
  catalog: any,
  products: any[],
  template: any,
  business: any,
  outputPath: string,
  options: any = {}
): Promise<string> {
  return generatePDFWithPDFKit(
    outputPath,
    {
      format: (catalog.settings?.pageSize || 'A4') as any,
      orientation: catalog.settings?.orientation || 'portrait',
      margin: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
      info: {
        title: catalog.name,
        author: business.name,
        subject: catalog.description || 'Product Catalog',
        keywords: 'catalog, products',
      },
    },
    (doc) => {
      // Add the catalog title
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(catalog.name, { align: 'center' })
         .moveDown(0.5);
      
      // Add the catalog description if it exists
      if (catalog.description) {
        doc.fontSize(12)
           .font('Helvetica')
           .text(catalog.description, { align: 'center' })
           .moveDown(0.5);
      }
      
      // Add the business name
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(business.name, { align: 'center' })
         .moveDown(1);
      
      // Add divider
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke()
         .moveDown(1);
      
      // Add products
      products.forEach((product, index) => {
        // New page if not the first product and we're near the bottom
        if (index > 0 && doc.y > doc.page.height - 200) {
          doc.addPage();
        }
        
        // Product title
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text(product.name, { continued: false })
           .moveDown(0.2);
        
        // Product SKU if available
        if (product.sku) {
          doc.fontSize(10)
             .font('Helvetica')
             .text(`SKU: ${product.sku}`, { continued: false })
             .moveDown(0.2);
        }
        
        // Product price if available
        if (product.price) {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(`Price: $${product.price}`, { continued: false })
             .moveDown(0.2);
        }
        
        // Product description if available
        if (product.description) {
          doc.fontSize(11)
             .font('Helvetica')
             .text(product.description, { continued: false })
             .moveDown(0.2);
        }
        
        // Add spacing between products
        doc.moveDown(1);
      });
      
      // Add footer
      const footerText = `Generated on ${new Date().toLocaleString()}`;
      const footerFontSize = 9;
      doc.fontSize(footerFontSize)
         .font('Helvetica')
         .text(
           footerText,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
      
      // Add page numbers if enabled
      if (catalog.settings?.showPageNumbers) {
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);
          doc.fontSize(footerFontSize)
             .font('Helvetica')
             .text(
               `Page ${i + 1} of ${totalPages}`,
               50,
               doc.page.height - 30,
               { align: 'center' }
             );
        }
      }
    }
  );
}