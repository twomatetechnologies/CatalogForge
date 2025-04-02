# Custom Templates

This directory contains custom catalog templates that can be used by the application. These templates are automatically detected and added to the template list in the application.

## Adding a New Template

To add a new custom template, follow these steps:

1. Create an HTML file with your template design (e.g., `my-template-name.html`)
2. Create an SVG thumbnail with the same base name (e.g., `my-template-name.svg`)
3. If your template requires special product layouts, create a product template (e.g., `my-template-name-product.html`)

## Template Variables

Templates can use the following variables that will be replaced by the system:

- `{{catalogName}}` - The name of the catalog
- `{{catalogDescription}}` - The description of the catalog
- `{{businessName}}` - The name of the business
- `{{businessLogo}}` - The URL to the business logo
- `{{businessDescription}}` - The description of the business
- `{{businessContact}}` - The contact information of the business
- `{{generatedDate}}` - The date the catalog was generated
- `{{products}}` - The placeholder where product listings will be inserted

## Product Template Variables

Product templates can use these variables:

- `{{productName}}` - The name of the product
- `{{productDescription}}` - The description of the product
- `{{productPrice}}` - The price of the product (formatted)
- `{{productSku}}` - The SKU of the product
- `{{productImage}}` - The image of the product
- `{{productCategory}}` - The category of the product
- `{{productTags}}` - The tags of the product

## Example Structure

A basic template file structure looks like:

```
my-template-name.html       // Main template file
my-template-name.svg        // Thumbnail for template selection
my-template-name-product.html  // (Optional) Product template
```

The system will automatically detect and register these templates when the application starts.