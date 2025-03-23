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
    // In a real implementation, we would use a CSV parsing library
    // For this prototype, we'll just simulate parsing a CSV
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This is a placeholder for CSV parsing logic
    // In a real application, we would parse the CSV data
    const result: ImportResult<Product> = {
      data: [],
      errors: [],
      totalRows: 0,
      successRows: 0
    };
    
    // Simulate some errors and successful imports
    result.errors.push('CSV import is simulated in this prototype');
    
    return result;
  } catch (error) {
    console.error('Error importing CSV:', error);
    throw new Error('Failed to import CSV file');
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
      } catch (e) {
        result.errors.push(`Row ${i + 1}: ${e.message || 'Unknown error'}`);
      }
    }
    
    return result;
  } catch (error) {
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
