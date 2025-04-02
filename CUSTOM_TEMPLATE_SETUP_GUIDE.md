# Custom Template Setup Guide

## Overview

This guide provides step-by-step instructions for adding custom templates to the Catalog Builder application. By following these guidelines, your marketing team can create and implement their own catalog designs.

## Prerequisites

- Access to the Catalog Builder application
- Basic knowledge of HTML and CSS (no JavaScript required)
- A text editor for creating the template files

## Template Files Structure

Each custom template requires three files:

1. **Main Template File** (`template-name.html`): Controls the overall layout
2. **Product Template File** (`template-name-product.html`): Defines how each product appears
3. **Template Thumbnail** (`template-name.svg`): An SVG image for the template selection UI

## Step 1: Create the Template Files

### 1.1. Create the Main Template File

This file (`template-name.html`) defines the overall structure of your catalog:

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{catalogName}}</title>
  <style>
    /* Your CSS styles here */
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .products-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{catalogName}}</h1>
    <p>{{catalogDescription}}</p>
    <div class="company-name">{{businessName}}</div>
  </div>
  
  <div class="products-container">
    {{products}}
  </div>
  
  <div class="footer">
    <p>Generated on {{generatedDate}}</p>
  </div>
</body>
</html>
```

### 1.2. Create the Product Template File

This file (`template-name-product.html`) defines how each product appears in the catalog:

```html
<div class="product-card">
  <div class="product-image">
    {{productImage}}
  </div>
  <div class="product-details">
    <div class="product-name">{{productName}}</div>
    {{productSku}}
    {{productPrice}}
    {{productDescription}}
  </div>
</div>
```

### 1.3. Create the Template Thumbnail

Create an SVG file (`template-name.svg`) with dimensions 200px × 140px that represents your template design. This will be displayed in the template selection interface.

## Step 2: Use Template Variables

Your templates can include special variables that will be automatically replaced with actual data:

### Main Template Variables

| Variable | Description |
|----------|-------------|
| `{{catalogName}}` | The name of the catalog |
| `{{catalogDescription}}` | The description of the catalog |
| `{{businessName}}` | The name of the business |
| `{{businessLogo}}` | The URL to the business logo |
| `{{businessDescription}}` | The description of the business |
| `{{businessContact}}` | The contact information of the business |
| `{{generatedDate}}` | The date the catalog was generated |
| `{{products}}` | The placeholder where product listings will be inserted |

### Product Template Variables

| Variable | Description |
|----------|-------------|
| `{{productName}}` | The name of the product |
| `{{productDescription}}` | The description of the product |
| `{{productPrice}}` | The price of the product (formatted) |
| `{{productSku}}` | The SKU of the product |
| `{{productImage}}` | The image of the product |
| `{{productCategory}}` | The category of the product |
| `{{productTags}}` | The tags of the product |

## Step 3: Add Templates to the Application

### Method 1: File System (Developer Approach)

1. Save your template files in the `public/templates/custom/` directory:
   - `public/templates/custom/template-name.html`
   - `public/templates/custom/template-name-product.html` 
   - `public/templates/custom/template-name.svg`

2. Restart the application or deploy the updated files.

3. The system will automatically detect and register your custom templates.

### Method 2: User Interface (Coming Soon)

In a future update, you'll be able to upload custom template files directly through the web interface.

## Step 4: Use Your Custom Template

1. Log in to the Catalog Builder application
2. Create a new catalog or edit an existing one
3. In the template selection section, you'll see your custom template
4. Select your template and continue creating your catalog
5. When you generate a PDF, your custom template will be applied

## Tips for Effective Templates

1. **Design for Print**: Remember your template will be used for PDF generation
2. **Support Different Page Sizes**: Account for both portrait and landscape formats
3. **Handle Missing Data**: Make sure your template looks good even if some product data is missing
4. **Optimize Images**: Use responsive image sizing to handle various product images
5. **Consistent Styling**: Keep styling consistent throughout the template
6. **Test Thoroughly**: Test your template with different products and catalog configurations

## Example Templates

The application includes several example templates you can study:

1. **Marketing Special**: A template with a colorful grid layout
2. **Seasonal Promotion**: A template designed for seasonal sales
3. **Premium Brochure**: A high-end template with elegant styling

## Troubleshooting

If your template isn't displaying correctly:

1. Check file naming: Make sure your files follow the naming convention exactly
2. Validate HTML: Ensure your HTML syntax is valid
3. Check variables: Make sure all variable names are spelled correctly
4. Try simplifying: If complex layouts cause issues, simplify your design

## Deployment with Docker

If you're using Docker to deploy the application, you can mount a volume to make custom templates persist across deployments:

```yaml
services:
  app:
    # ... other configuration ...
    volumes:
      - ./custom_templates:/app/public/templates/custom
```

## Getting Help

If you encounter issues with your custom templates, refer to the detailed developer documentation in:

- `public/templates/custom/DESIGNER_GUIDE.md`
- `TEMPLATE_SYSTEM_GUIDE.md`

For technical assistance, please contact your system administrator.