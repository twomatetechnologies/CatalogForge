# Catalog Builder Application

A comprehensive application that empowers businesses to create, customize, and manage professional product catalogs with advanced template design and seamless PDF generation capabilities.

## Features

- Create and manage business profiles
- Add and organize product catalogs
- Use built-in templates or add custom templates
- Generate and download PDF catalogs
- Import/export product data
- Responsive web interface

## Docker Deployment

This project can be easily deployed using Docker and Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Deployment Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd catalog-builder
   ```

2. Build and start the containers:
   ```
   docker-compose up -d
   ```

   This will start the following services:
   - PostgreSQL database
   - Web application (frontend + backend)

3. Access the application:
   Open your browser and navigate to `http://localhost:5000`

### Environment Configuration

The application uses environment variables for configuration. You can modify them in the `.env` file or by setting them directly in the `docker-compose.yml` file.

Important environment variables:

- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: The port on which the application will run
- `DATABASE_URL`: PostgreSQL connection string
- `PDF_STORAGE_PATH`: Path where generated PDFs are stored
- `TEMPLATES_PATH`: Path to templates directory
- `CUSTOM_TEMPLATES_PATH`: Path to custom templates directory

### Adding Custom Templates

To add custom templates:

1. Place your HTML template files in the `public/templates/custom/` directory
2. Create an SVG thumbnail with the same base name as your HTML file
3. If needed, create a product template with the "-product" suffix
4. Restart the application or container to detect new templates

#### Template Structure

A custom template consists of these files:

```
my-template-name.html         # Main template file
my-template-name.svg          # Thumbnail image (required for UI)
my-template-name-product.html # Product template (optional)
```

#### Template Variables

Templates use variables enclosed in double curly braces that will be replaced when generating catalogs:

```
{{catalogName}}           # Name of the catalog
{{catalogDescription}}    # Description of the catalog
{{businessName}}          # Business name
{{businessLogo}}          # Business logo URL
{{products}}              # Container for product listings
```

View the `public/templates/custom/README.md` file for a complete list of available variables.

### Data Persistence

The following Docker volumes are used for data persistence:

- `postgres_data`: PostgreSQL database data
- `pdf_storage`: Generated PDF files

### Logs

To view application logs:
```
docker-compose logs -f web
```

To view database logs:
```
docker-compose logs -f postgres
```

## Development

For local development without Docker:

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables (modify `.env` file)

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at `http://localhost:5000`

## License

MIT