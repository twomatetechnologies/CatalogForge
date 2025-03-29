import fs from 'fs';
import path from 'path';
import { Catalog, Product, Template, Business } from '../shared/schema';

/**
 * Renders a catalog using a template file
 * @param catalog The catalog to render
 * @param products List of products to include
 * @param template The template to use
 * @param business The business information
 * @returns HTML content for the catalog
 */
export async function renderCatalogWithTemplate(
  catalog: Catalog,
  products: Product[],
  template: Template,
  business: Business
): Promise<string> {
  try {
    // Handle custom template type from database
    const layout = template.layout as any;
    if (layout.type === 'custom' && layout.customTemplate) {
      // This template was auto-discovered from the filesystem
      const customTemplatePath = path.join(process.cwd(), 'public', 'templates', 'custom', layout.customTemplate);
      const customProductPath = path.join(
        process.cwd(), 
        'public', 
        'templates', 
        'custom', 
        layout.customTemplate.replace('.html', '-product.html')
      );
      
      console.log(`Using custom template: ${customTemplatePath}`);
      return await renderCustomTemplate(
        customTemplatePath,
        customProductPath,
        catalog,
        products,
        business
      );
    }
    
    // Check if there's a custom template file based on naming convention
    const customTemplatePath = path.join(process.cwd(), 'public', 'templates', 'custom', `${template.name.toLowerCase().replace(/\s+/g, '-')}.html`);
    const customProductPath = path.join(process.cwd(), 'public', 'templates', 'custom', `${template.name.toLowerCase().replace(/\s+/g, '-')}-product.html`);
    
    let templateExists = false;
    let productTemplateExists = false;
    
    try {
      if (fs.existsSync(customTemplatePath)) {
        templateExists = true;
      }
      
      if (fs.existsSync(customProductPath)) {
        productTemplateExists = true;
      }
    } catch (error) {
      console.error('Error checking for template files:', error);
    }
    
    if (templateExists) {
      // Custom template found, use it
      console.log(`Using custom template: ${customTemplatePath}`);
      let templateContent = fs.readFileSync(customTemplatePath, 'utf8');
      
      // Replace variables in the template
      templateContent = templateContent
        .replace(/{{catalogName}}/g, catalog.name)
        .replace(/{{catalogDescription}}/g, catalog.description || '')
        .replace(/{{businessName}}/g, business.name)
        .replace(/{{generatedDate}}/g, new Date().toLocaleString());
      
      // Generate product HTML
      let productsHtml = '';
      
      // If there's a custom product template, use it for each product
      if (productTemplateExists) {
        const productTemplate = fs.readFileSync(customProductPath, 'utf8');
        
        for (const product of products) {
          let productHtml = productTemplate;
          
          // Handle product image
          let imageHtml = 'No Image';
          if (product.images && product.images[0]) {
            imageHtml = `<img src="${product.images[0]}" alt="${product.name}">`;
          }
          
          // Replace variables in the product template
          productHtml = productHtml
            .replace(/{{productName}}/g, product.name)
            .replace(/{{productImage}}/g, imageHtml)
            .replace(/{{productSku}}/g, product.sku ? `<div class="product-sku">SKU: ${product.sku}</div>` : '')
            .replace(/{{productPrice}}/g, product.price ? `<div class="product-price">$${product.price}</div>` : '')
            .replace(/{{productDescription}}/g, product.description ? `<div class="product-description">${product.description}</div>` : '');
          
          productsHtml += productHtml;
        }
      } else {
        // Use default product layout
        for (const product of products) {
          let imageHtml = 'No Image';
          if (product.images && product.images[0]) {
            imageHtml = `<img src="${product.images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">`;
          }
          
          productsHtml += `
            <div class="product">
              <div class="product-image">${imageHtml}</div>
              <div class="product-details">
                <div class="product-name">${product.name}</div>
                ${product.sku ? `<div class="product-sku">SKU: ${product.sku}</div>` : ''}
                ${product.price ? `<div class="product-price">$${product.price}</div>` : ''}
                ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
              </div>
            </div>
          `;
        }
      }
      
      // Replace the products placeholder with the actual product HTML
      templateContent = templateContent.replace(/{{products}}/g, productsHtml);
      
      return templateContent;
    } else {
      // No custom template found, generate a dynamic template based on template layout type
      console.log(`No custom template found for ${template.name}, generating based on layout type`);
      
      return generateDynamicTemplate(catalog, products, template, business);
    }
  } catch (error) {
    console.error('Error rendering template:', error);
    // Return a simple fallback template if there's an error
    return generateFallbackTemplate(catalog, products, business);
  }
}

/**
 * Generates a dynamic template based on the template layout settings
 */
function generateDynamicTemplate(
  catalog: Catalog,
  products: Product[],
  template: Template,
  business: Business
): string {
  const layout = template.layout as {
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
  };
  
  let productHtml = '';
  
  // Generate different product layouts based on template type
  switch(layout.type) {
    case 'grid':
      productHtml = generateGridLayout(products, layout);
      break;
    case 'featured':
      productHtml = generateFeaturedLayout(products, layout);
      break;
    case 'list':
      productHtml = generateListLayout(products, layout);
      break;
    case 'showcase':
      productHtml = generateShowcaseLayout(products, layout);
      break;
    default:
      productHtml = generateGridLayout(products, layout);
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${catalog.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        ${getLayoutStyles(layout)}
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${catalog.name}</h1>
        <p>${catalog.description || ''}</p>
        <p>${business.name}</p>
      </div>
      
      <div class="products ${layout.type}-layout">
        ${productHtml}
      </div>
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates a grid layout for products
 */
function generateGridLayout(products: Product[], layout: any): string {
  const columns = layout.columns || 2;
  let html = `<div class="product-grid" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px;">`;
  
  products.forEach(product => {
    let imageHtml = 'No Image';
    if (product.images && product.images[0]) {
      imageHtml = `<img src="${product.images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">`;
    }
    
    html += `
      <div class="product-card">
        ${layout.showImage !== false ? `<div class="product-image">${imageHtml}</div>` : ''}
        <div class="product-details">
          <div class="product-name">${product.name}</div>
          ${layout.showSKU && product.sku ? `<div class="product-sku">SKU: ${product.sku}</div>` : ''}
          ${layout.showPrice && product.price ? `<div class="product-price">$${product.price}</div>` : ''}
          ${layout.showDescription && product.description ? `<div class="product-description">${product.description}</div>` : ''}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

/**
 * Generates a featured layout for products
 */
function generateFeaturedLayout(products: Product[], layout: any): string {
  let html = '';
  
  products.forEach(product => {
    let imageHtml = 'No Image';
    if (product.images && product.images[0]) {
      imageHtml = `<img src="${product.images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">`;
    }
    
    const imagePosition = layout.imagePosition || 'left';
    
    html += `
      <div class="featured-product" style="display: flex; margin-bottom: 50px; ${imagePosition === 'right' ? 'flex-direction: row-reverse;' : ''}">
        <div class="product-image" style="flex: 1; padding: 20px;">
          ${imageHtml}
        </div>
        <div class="product-details" style="flex: 2; padding: 20px;">
          <h2 class="product-name">${product.name}</h2>
          ${layout.showPrice && product.price ? `<div class="product-price" style="font-size: 24px; color: #e63946; margin: 10px 0;">$${product.price}</div>` : ''}
          ${layout.showDescription && product.description ? `<div class="product-description" style="margin: 15px 0; line-height: 1.6;">${product.description}</div>` : ''}
          ${layout.showFeatures && product.description ? `
            <div class="product-features">
              <h3>Key Features</h3>
              <ul>
                ${product.description.split('.').filter(s => s.trim().length > 0).map(feature => `<li>${feature.trim()}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
      <hr style="border: 0; height: 1px; background: #ddd; margin: 30px 0;">
    `;
  });
  
  return html;
}

/**
 * Generates a list layout for products
 */
function generateListLayout(products: Product[], layout: any): string {
  const compact = layout.compact === true;
  let html = `<div class="product-list">`;
  
  products.forEach(product => {
    let imageHtml = '';
    if (layout.showImage !== false && product.images && product.images[0]) {
      imageHtml = `<img src="${product.images[0]}" alt="${product.name}" style="width: ${compact ? '60px' : '80px'}; height: ${compact ? '60px' : '80px'}; object-fit: contain; margin-right: 15px;">`;
    }
    
    html += `
      <div class="product-list-item" style="display: flex; align-items: ${compact ? 'center' : 'flex-start'}; padding: ${compact ? '10px' : '20px'} 0; border-bottom: 1px solid #eee;">
        ${imageHtml}
        <div class="product-info" style="flex: 1;">
          <div class="product-name" style="font-weight: bold; ${compact ? 'font-size: 14px;' : ''}">${product.name}</div>
          ${layout.showSKU && product.sku ? `<div class="product-sku" style="font-size: 12px; color: #777;">${product.sku}</div>` : ''}
          ${layout.showDescription && product.description && !compact ? `<div class="product-description" style="margin-top: 5px; font-size: 14px; color: #555;">${product.description}</div>` : ''}
        </div>
        ${layout.showPrice && product.price ? `<div class="product-price" style="font-weight: bold; color: #e63946; ${compact ? 'font-size: 14px;' : 'font-size: 18px;'} min-width: 80px; text-align: right;">$${product.price}</div>` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

/**
 * Generates a showcase layout for products
 */
function generateShowcaseLayout(products: Product[], layout: any): string {
  let html = `<div class="product-showcase">`;
  
  products.forEach(product => {
    let imageHtml = '';
    if (layout.showImage !== false && product.images && product.images[0]) {
      imageHtml = `
        <div class="product-image-showcase" style="text-align: center; margin-bottom: 30px;">
          <img src="${product.images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 300px; object-fit: contain;">
        </div>
      `;
    }
    
    let bulletPoints = '';
    if (layout.showBulletPoints && product.description) {
      const points = product.description.split('.').filter(p => p.trim().length > 0);
      if (points.length > 0) {
        bulletPoints = `
          <div class="product-features" style="margin-top: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">Product Features</h3>
            <ul style="${layout.highlightFeatures ? 'list-style-type: none; padding-left: 0;' : ''}">
              ${points.map(point => `
                <li style="${layout.highlightFeatures ? 'background: #f8f9fa; padding: 10px; margin-bottom: 8px; border-left: 3px solid #4dabf7;' : 'margin-bottom: 8px;'}">
                  ${point.trim()}
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      }
    }
    
    html += `
      <div class="product-showcase-item" style="margin-bottom: 60px; padding-bottom: 40px; border-bottom: 1px solid #ddd;">
        <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px; font-size: 28px;">${product.name}</h2>
        ${imageHtml}
        <div class="product-details-showcase" style="max-width: 800px; margin: 0 auto;">
          ${product.description && !layout.showBulletPoints ? `
            <div class="product-description" style="line-height: 1.6; color: #555; margin-bottom: 20px;">
              ${product.description}
            </div>
          ` : ''}
          ${bulletPoints}
          <div class="product-meta" style="display: flex; justify-content: space-between; margin-top: 30px; background: #f8f9fa; padding: 15px; border-radius: 5px;">
            ${product.sku ? `<div class="product-sku" style="color: #666;">SKU: ${product.sku}</div>` : ''}
            ${product.price ? `<div class="product-price" style="font-weight: bold; color: #e63946; font-size: 20px;">$${product.price}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

/**
 * Returns CSS styles based on the layout type
 */
function getLayoutStyles(layout: {
  type: 'grid' | 'featured' | 'list' | 'showcase';
  [key: string]: any;
}): string {
  switch(layout.type) {
    case 'grid':
      return `
        .product-card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: white; }
        .product-image { height: 200px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
        .product-details { padding: 15px; }
        .product-name { font-weight: bold; margin-bottom: 5px; }
        .product-price { color: #e63946; font-weight: bold; margin: 5px 0; }
        .product-sku { font-size: 12px; color: #999; margin-bottom: 5px; }
        .product-description { font-size: 14px; color: #666; margin-top: 10px; }
      `;
    case 'featured':
      return `
        .featured-product { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .product-name { color: #2c3e50; margin-top: 0; }
      `;
    case 'list':
      return `
        .product-list { background: white; border-radius: 8px; padding: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
      `;
    case 'showcase':
      return `
        .product-showcase { max-width: 900px; margin: 0 auto; }
        .product-showcase-item { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
      `;
    default:
      return '';
  }
}

/**
 * Renders a custom template from a file with product templates
 */
async function renderCustomTemplate(
  templatePath: string,
  productTemplatePath: string,
  catalog: Catalog,
  products: Product[],
  business: Business
): Promise<string> {
  try {
    // Check if template files exist
    if (!fs.existsSync(templatePath)) {
      console.error(`Custom template file not found: ${templatePath}`);
      throw new Error('Custom template file not found');
    }
    
    // Read the template
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Replace variables in the template
    templateContent = templateContent
      .replace(/{{catalogName}}/g, catalog.name)
      .replace(/{{catalogDescription}}/g, catalog.description || '')
      .replace(/{{businessName}}/g, business.name)
      .replace(/{{generatedDate}}/g, new Date().toLocaleString());
    
    // Generate product HTML
    let productsHtml = '';
    
    // Check if there's a product template to use
    const hasProductTemplate = fs.existsSync(productTemplatePath);
    
    if (hasProductTemplate) {
      const productTemplate = fs.readFileSync(productTemplatePath, 'utf8');
      
      for (const product of products) {
        let productHtml = productTemplate;
        
        // Handle product image
        let imageHtml = 'No Image';
        if (product.images && product.images[0]) {
          imageHtml = `<img src="${product.images[0]}" alt="${product.name}">`;
        }
        
        // Replace variables in the product template
        productHtml = productHtml
          .replace(/{{productName}}/g, product.name)
          .replace(/{{productImage}}/g, imageHtml)
          .replace(/{{productSku}}/g, product.sku ? `<div class="product-sku">SKU: ${product.sku}</div>` : '')
          .replace(/{{productPrice}}/g, product.price ? `<div class="product-price">$${product.price}</div>` : '')
          .replace(/{{productDescription}}/g, product.description ? `<div class="product-description">${product.description}</div>` : '');
        
        productsHtml += productHtml;
      }
    } else {
      // If no product template, use a simple default
      for (const product of products) {
        let imageHtml = 'No Image';
        if (product.images && product.images[0]) {
          imageHtml = `<img src="${product.images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">`;
        }
        
        productsHtml += `
          <div class="product">
            <div class="product-image">${imageHtml}</div>
            <div class="product-details">
              <div class="product-name">${product.name}</div>
              ${product.sku ? `<div class="product-sku">SKU: ${product.sku}</div>` : ''}
              ${product.price ? `<div class="product-price">$${product.price}</div>` : ''}
              ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
            </div>
          </div>
        `;
      }
    }
    
    // Replace the products placeholder with the actual product HTML
    templateContent = templateContent.replace(/{{products}}/g, productsHtml);
    
    return templateContent;
  } catch (error) {
    console.error('Error rendering custom template:', error);
    return generateFallbackTemplate(catalog, products, business);
  }
}

/**
 * Generates a fallback template in case of errors
 */
function generateFallbackTemplate(
  catalog: Catalog,
  products: Product[],
  business: Business
): string {
  let productHtml = '';
  
  for (const product of products) {
    let imageHtml = 'No Image';
    if (product.images && product.images[0]) {
      imageHtml = `<img src="${product.images[0]}" alt="${product.name}" style="max-width: 100%; max-height: 100%;">`;
    }
    
    productHtml += `
      <div style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px;">
        <div style="width: 100px; height: 100px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; float: left; margin-right: 15px;">
          ${imageHtml}
        </div>
        <div>
          <div style="font-weight: bold;">${product.name}</div>
          ${product.sku ? `<div style="font-size: 12px; color: #777;">SKU: ${product.sku}</div>` : ''}
          ${product.price ? `<div style="color: #e63946; font-weight: bold;">$${product.price}</div>` : ''}
          ${product.description ? `<div style="color: #666; margin-top: 5px; font-size: 14px;">${product.description}</div>` : ''}
        </div>
        <div style="clear: both;"></div>
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${catalog.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 30px;">
        <h1>${catalog.name}</h1>
        <p>${catalog.description || ''}</p>
        <p>${business.name}</p>
      </div>
      
      <div>
        ${productHtml}
      </div>
      
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}