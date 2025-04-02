# Template System Guide

This directory contains the template system for the catalog builder application. Templates are used to define how the catalogs are displayed when rendered into HTML or PDF.

## Template Types

The system supports two main types of templates:

1. **Built-in Templates**: These are defined programmatically by the system and include common layouts like grid, featured, list, and showcase.
2. **Custom Templates**: These are HTML templates that can be created by design teams and placed in the `custom` directory.

## Built-in Template Layouts

The default template system supports several layout types:

- **Grid**: A grid of products with customizable columns
- **Featured**: Highlights each product with larger images and more detail
- **List**: A compact list view, good for price lists
- **Showcase**: A detailed view that emphasizes product features

## Custom Templates

To learn more about creating custom templates, see the [Custom Templates README](./custom/README.md) in the custom directory.

## Template Structure

Each template has the following properties:

- **id**: Unique identifier
- **name**: Display name
- **description**: Brief description of the template
- **thumbnail**: Path to the thumbnail image (SVG recommended)
- **layout**: Configuration object controlling the template appearance
- **isDefault**: Whether this is the default template

## Layout Configuration

The layout configuration object has these properties:

```typescript
{
  type: 'grid' | 'featured' | 'list' | 'showcase' | 'custom';
  columns?: number;                            // For grid layouts
  rows?: number;                               // For grid layouts
  showPrice?: boolean;                         // Whether to show prices
  showSKU?: boolean;                           // Whether to show SKUs
  showDescription?: boolean;                   // Whether to show descriptions
  showImage?: boolean;                         // Whether to show images
  showFeatures?: boolean;                      // Whether to show feature bullets
  showBulletPoints?: boolean;                  // Whether to format as bullet points
  highlightFeatures?: boolean;                 // Whether to highlight features
  imagePosition?: 'left' | 'right' | 'top';    // Position of images
  compact?: boolean;                           // Compact view option
  customTemplate?: string;                     // For custom templates, the filename
}
```

## Adding a New Template

### Adding a Built-in Template Layout

To add a new built-in template layout type:

1. Add the new layout type to the type definition in the Template interface
2. Create a function in `server/templateRenderer.ts` to generate the HTML for this layout
3. Add the new layout type to the switch statement in the `generateDynamicTemplate` function
4. Create corresponding CSS in the `getLayoutStyles` function

### Adding a Custom Template

To add a new custom template, follow the steps in the [Custom Templates README](./custom/README.md).

## PDF Generation

Templates are used by the PDF generation system to create downloadable PDFs for catalogs. When generating a PDF, the template is first rendered to HTML using the template renderer, then converted to PDF using either PDFKit (for simpler documents) or Puppeteer (for more complex layouts with CSS).

## Examples

Example custom templates are provided in the `custom` directory to help you get started.