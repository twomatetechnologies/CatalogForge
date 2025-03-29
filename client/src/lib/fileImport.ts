import { Product } from '@/types';

// This file contains utility functions for handling file imports (CSV, Excel, JSON)

export interface ImportResult<T> {
  data: T[];
  errors: string[];
  totalRows: number;
  successRows: number;
}

export async function importProductsFromCSV(
  file: File, 
  businessId: number
): Promise<ImportResult<Product>> {
  try {
    const text = await file.text();
    const lines = text.split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file must have a header row and at least one data row');
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
      throw new Error('CSV file must contain a "name" column');
    }
    
    // Parse each data row
    const result: ImportResult<Product> = {
      data: [],
      errors: [],
      totalRows: lines.length - 1, // Exclude header row
      successRows: 0
    };
    
    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      try {
        // Split the line and respect quoted values
        const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        
        // Create a product object
        const product: Partial<Product> = {
          businessId,
          id: 0, // ID will be assigned by the server
          name: nameIndex >= 0 ? row[nameIndex] : '',
          active: true // Default to active
        };
        
        // Add optional fields if available
        if (descriptionIndex >= 0) product.description = row[descriptionIndex];
        if (skuIndex >= 0) product.sku = row[skuIndex];
        if (priceIndex >= 0) product.price = row[priceIndex];
        if (categoryIndex >= 0) product.category = row[categoryIndex];
        
        // Process tags - comma-separated string of tags
        if (tagsIndex >= 0 && row[tagsIndex]) {
          product.tags = row[tagsIndex].split(';').map(tag => tag.trim());
        }
        
        // Process active status
        if (activeIndex >= 0) {
          const activeValue = row[activeIndex].toLowerCase();
          product.active = !(activeValue === 'false' || activeValue === 'no' || activeValue === '0');
        }
        
        // Validate required fields
        if (!product.name) {
          result.errors.push(`Row ${i}: Missing required field 'name'`);
          continue;
        }
        
        result.data.push(product as Product);
        result.successRows++;
      } catch (e: any) {
        result.errors.push(`Row ${i}: ${e.message || 'Invalid format'}`);
      }
    }
    
    return result;
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    throw new Error(`Failed to import CSV file: ${error.message}`);
  }
}

export async function importProductsFromJSON(
  file: File, 
  businessId: number
): Promise<ImportResult<Product>> {
  try {
    const text = await file.text();
    let json: any;
    
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
    
    // Ensure we have an array of products
    const productsArray = Array.isArray(json) ? json : [json];
    
    // Initialize result
    const result: ImportResult<Product> = {
      data: [],
      errors: [],
      totalRows: productsArray.length,
      successRows: 0
    };
    
    // Process each product
    for (let i = 0; i < productsArray.length; i++) {
      try {
        const rawProduct = productsArray[i];
        
        // Validate required fields
        if (!rawProduct.name) {
          result.errors.push(`Row ${i + 1}: Missing required field 'name'`);
          continue;
        }
        
        // Create a product object with the businessId
        const product: Product = {
          ...rawProduct,
          id: 0, // ID will be assigned by the server
          businessId,
          active: rawProduct.active !== false // Default to active if not specified
        };
        
        result.data.push(product);
        result.successRows++;
      } catch (e: any) {
        result.errors.push(`Row ${i + 1}: ${e.message || 'Unknown error'}`);
      }
    }
    
    return result;
  } catch (error: any) {
    console.error('Error importing JSON:', error);
    throw new Error(`Failed to import JSON file: ${error.message}`);
  }
}

export function exportProductsToCSV(products: Product[]): string {
  if (!products || products.length === 0) {
    return 'No products to export';
  }

  // Get headers from the first product
  const headers = Object.keys(products[0]).filter(key => 
    // Filter out complex objects that can't be represented in CSV easily
    !['id', 'images', 'tags', 'variations'].includes(key)
  );
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  products.forEach(product => {
    const row = headers.map(header => {
      const value = product[header as keyof Product];
      
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle string escaping for CSV
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
