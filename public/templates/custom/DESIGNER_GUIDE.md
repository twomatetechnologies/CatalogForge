# Template Designer Guide

## Introduction

This guide is intended for designers and marketing teams who want to create custom templates for the catalog builder application. No programming experience is required, but familiarity with HTML and CSS will be helpful.

## Template Components

A custom template consists of these files:

1. **HTML Template** (required): The main layout of your catalog (e.g., `my-template.html`)
2. **Product Template** (optional): How each product should appear (e.g., `my-template-product.html`)
3. **Thumbnail** (required): An SVG representation of your template for the template selection UI (e.g., `my-template.svg`)

## Naming Conventions

- All filenames should use kebab-case (lowercase with hyphens)
- The product template must have the same name as the main template with "-product" added
- All three files should share the same base name

Example:
```
summer-sale.html             # Main template
summer-sale-product.html     # Product template
summer-sale.svg              # Thumbnail
```

## Template Variables

Templates use variables enclosed in double curly braces that will be replaced when the catalog is generated.

### Main Template Variables

- `{{catalogName}}` - The name of the catalog
- `{{catalogDescription}}` - The description of the catalog
- `{{businessName}}` - The name of the business
- `{{businessLogo}}` - The URL to the business logo
- `{{businessDescription}}` - The description of the business
- `{{businessContact}}` - The contact information of the business
- `{{generatedDate}}` - The date the catalog was generated
- `{{products}}` - The placeholder where product listings will be inserted

### Product Template Variables

- `{{productName}}` - The name of the product
- `{{productDescription}}` - The description of the product
- `{{productPrice}}` - The price of the product (formatted)
- `{{productSku}}` - The SKU of the product
- `{{productImage}}` - The image of the product
- `{{productCategory}}` - The category of the product
- `{{productTags}}` - The tags of the product

## HTML Template Structure

### Basic Structure

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{catalogName}}</title>
  <style>
    /* Your CSS styles here */
  </style>
</head>
<body>
  <div class="header">
    <h1>{{catalogName}}</h1>
    <p>{{catalogDescription}}</p>
    <div class="company-info">{{businessName}}</div>
  </div>
  
  <div class="products-container">
    {{products}} <!-- This is where products will be inserted -->
  </div>
  
  <div class="footer">
    <p>Generated on {{generatedDate}}</p>
  </div>
</body>
</html>
```

### Product Template Structure

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

## CSS Styling

Include all your CSS within a `<style>` block in the `<head>` section of your main template. Make sure to:

1. Use specific class names to avoid conflicts
2. Keep styles contained within your template (don't use external stylesheets)
3. Test your design with various screen sizes

## Thumbnail Guidelines

- Create an SVG file with dimensions 200px × 140px
- Make it representative of your template design
- Include layout elements but keep text minimal
- Use colors that match your template

## Best Practices

1. **Test with Sample Data**: Make sure your template looks good with various product data
2. **Mobile-Friendly**: Use responsive design techniques
3. **Page Breaks**: Consider where page breaks might occur in the PDF
4. **Image Handling**: Account for products with and without images
5. **Text Length**: Handle both long and short text gracefully
6. **Distinct Look**: Make your template visually unique from others

## Example

See the included templates for examples of how to structure your files:

- `marketing-special.html`
- `marketing-special-product.html`
- `marketing-special.svg`

## Submission

After creating your template files, place them in this `custom` directory. The application will automatically detect them on restart.

## Testing Your Template

To test your template:

1. Place your files in this directory
2. Restart the application
3. Create a new catalog and select your template
4. Generate a PDF to see how it looks