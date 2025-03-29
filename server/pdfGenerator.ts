import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

/**
 * Generates a PDF file from HTML content
 * @param htmlContent The HTML content to convert to PDF
 * @param outputPath The path where the PDF file should be saved
 * @param options Additional PDF generation options
 * @returns The path to the generated PDF file
 */
export async function generatePDF(
  htmlContent: string,
  outputPath: string,
  options: {
    format?: 'A4' | 'Letter' | 'Legal';
    orientation?: 'portrait' | 'landscape';
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  } = {}
): Promise<string> {
  try {
    console.log('Starting PDF generation with Puppeteer');
    
    // Set default options
    const format = options.format || 'A4';
    const orientation = options.orientation || 'portrait';
    const margin = options.margin || {
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm',
    };
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create a temporary HTML file to render
    const tempHtmlPath = `${outputPath}.html`;
    fs.writeFileSync(tempHtmlPath, htmlContent);
    
    // Launch a browser instance
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    try {
      // Create a new page
      const page = await browser.newPage();
      
      // Configure the page
      await page.setViewport({
        width: 1200,
        height: 1600,
      });
      
      // Navigate to the HTML file
      await page.goto(`file://${tempHtmlPath}`, {
        waitUntil: 'networkidle0',
      });
      
      console.log(`Generating PDF with format: ${format}, orientation: ${orientation}`);
      
      // Generate the PDF
      await page.pdf({
        path: outputPath,
        format: format as any,
        landscape: orientation === 'landscape',
        margin: margin,
        printBackground: true,
      });
      
      console.log(`PDF generated successfully at: ${outputPath}`);
      
      return outputPath;
    } finally {
      // Close the browser
      await browser.close();
      
      // Remove the temporary HTML file
      try {
        fs.unlinkSync(tempHtmlPath);
      } catch (error) {
        console.warn('Failed to delete temporary HTML file:', error);
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}