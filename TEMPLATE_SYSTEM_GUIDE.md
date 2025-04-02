# Catalog Builder Template System Guide

## Introduction

The Catalog Builder application features a powerful and flexible template system that allows businesses to create custom catalog designs. This guide explains how the template system works and how marketing teams can create their own custom templates.

## Template Types

The system supports two main types of templates:

1. **Built-in Templates**: These are predefined templates with various layouts including grid, featured, list, and showcase.
2. **Custom Templates**: HTML-based templates created by your design team, offering complete control over the catalog appearance.

## How Templates Work

Templates define the visual structure and presentation of your catalogs. When you generate a catalog PDF, the system:

1. Loads the selected template
2. Populates it with your business and product data
3. Renders the content to HTML
4. Converts the HTML to a PDF document

## Adding Custom Templates

Custom templates give your marketing team complete control over the look and feel of your catalogs. To add a custom template:

### Step 1: Create the Template Files

Create the following files:

1. **Main Template** (`template-name.html`): The overall layout of your catalog
2. **Product Template** (`template-name-product.html`): How each product is displayed
3. **Thumbnail** (`template-name.svg`): An SVG image used in the template selection UI

### Step 2: Design the Templates

Custom templates use HTML and CSS for layout and styling. Templates can use variables (enclosed in double curly braces) that the system will replace with actual data:

```html
<h1>{{catalogName}}</h1>
<p>{{catalogDescription}}</p>
<div class="company-name">{{businessName}}</div>

<div class="products-container">
  {{products}}
</div>
```

### Step 3: Add Template Files to the System

Place your template files in the `public/templates/custom/` directory. The application will automatically detect and register them.

### Step 4: Restart the Application

Restart the application to detect the new templates. They will appear in the template selection interface when creating or editing catalogs.

## Template Variables

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

## Built-in Template Types

The system includes several built-in template types:

### Grid Layout

A grid of products with customizable columns. Good for product catalogs with many items.

### Featured Layout

Highlights each product with larger images and more detail. Great for showcasing premium products.

### List Layout

A compact list view with minimal details. Excellent for price lists or quick reference guides.

### Showcase Layout

A detailed view that emphasizes product features and descriptions. Perfect for high-end products.

## Detailed Documentation

For more detailed information about creating templates, please refer to these resources:

- [Template System README](public/templates/README.md)
- [Custom Templates Guide](public/templates/custom/README.md)
- [Designer Guide](public/templates/custom/DESIGNER_GUIDE.md)

## Example Templates

The application includes several example templates to help you get started:

- **Marketing Special**: A marketing-focused template with a product grid
- **Seasonal Promotion**: A template designed for seasonal sales and promotions
- **Premium Brochure**: A high-end brochure design with cover page and product details

You can study these examples to understand how to create your own custom templates.

## Best Practices

1. **Test with Real Data**: Always test your templates with actual product data
2. **Mobile-Friendly Design**: Use responsive design principles
3. **Consistent Styling**: Keep styling consistent throughout the template
4. **Handle Edge Cases**: Account for products with missing data or images
5. **Readable Typography**: Ensure text is easily readable in both HTML and PDF formats

## Troubleshooting

If you encounter issues with template rendering or PDF generation:

1. Check the HTML output first (the system saves both HTML and PDF versions)
2. Verify all required template files are present with the correct naming
3. Ensure your template uses the correct variable names
4. Simplify complex CSS if PDFs aren't rendering correctly

For more help, contact system support.