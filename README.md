
# Catalog Builder Application

A comprehensive application for creating, customizing, and managing professional product catalogs with advanced template design and PDF generation capabilities.

## 🚀 Quick Start

1. **Clone the Repository**
```bash
git clone <repository-url>
cd catalog-builder
```

2. **Development Setup**

Without Docker:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://0.0.0.0:5000

## 🏗️ Project Structure

```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── public/          # Static assets and templates
├── shared/          # Shared types and configs
└── init-db/         # Database initialization scripts
```

## 🔧 Configuration

### Environment Variables

Key environment variables:
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Application port (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `PDF_STORAGE_PATH`: Path for generated PDFs
- `TEMPLATES_PATH`: Path to templates directory
- `CUSTOM_TEMPLATES_PATH`: Path to custom templates directory

## 📝 Template System

### Template Types

1. **Built-in Templates**:
   - Grid Layout
   - Featured Layout
   - List Layout
   - Showcase Layout

2. **Custom Templates**: User-created HTML templates

### Template Structure

Each custom template requires:

```
my-template-name.html         # Main template file
my-template-name.svg          # Thumbnail image (required for UI)
my-template-name-product.html # Product template (optional)
```

### Template Variables

Main Template Variables:
```
{{catalogName}}           # Name of the catalog
{{catalogDescription}}    # Description of the catalog
{{businessName}}         # Business name
{{businessLogo}}         # Business logo URL
{{products}}             # Container for product listings
```

Product Template Variables:
```
{{productName}}          # Product name
{{productDescription}}   # Product description
{{productPrice}}         # Formatted price
{{productSku}}          # Product SKU
{{productImage}}         # Product image URL
{{productCategory}}      # Product category
{{productTags}}          # Product tags
```

### Adding Custom Templates

1. Create template files in `public/templates/custom/`
2. Follow naming convention: `template-name.html`
3. Create SVG thumbnail with matching name
4. Add product template if needed
5. Restart application to detect new templates

## 🔍 Development

```bash
# Run tests
npm run test

# Type checking
npm run check

# Build for production
npm run build
```

## 📚 Documentation

- [Template System Guide](TEMPLATE_SYSTEM_GUIDE.md)
- [Custom Template Setup](CUSTOM_TEMPLATE_SETUP_GUIDE.md)
- [Deployment Guide](DEPLOYMENT_QUICK_START.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details
