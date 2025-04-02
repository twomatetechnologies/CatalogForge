# Deployment Quick Start Guide

This guide provides step-by-step instructions for deploying the Catalog Builder application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your server
- Basic command line knowledge
- Access to the application source code

## Deployment Steps

### Step 1: Prepare Your Environment

1. Clone or download the application source code to your server.

2. Navigate to the application directory:
   ```bash
   cd catalog-builder
   ```

3. Create an environment file for production settings:
   ```bash
   cp .env .env.production
   ```

4. Edit the `.env.production` file to set appropriate values for your environment:
   ```
   NODE_ENV=production
   PORT=3000
   
   # Database configuration
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_NAME=catalog_builder
   
   # Session secret (change this to a random secure string)
   SESSION_SECRET=your_secure_session_secret
   ```

### Step 2: Run the Deployment Script

The application includes a deployment script that automates the process:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Check for required dependencies
- Create necessary directories
- Verify your environment file
- Build and start Docker containers

### Step 3: Verify the Deployment

1. Check if the containers are running:
   ```bash
   docker-compose ps
   ```

2. Check the application logs:
   ```bash
   docker-compose logs -f app
   ```

3. Access the application:
   Open your web browser and navigate to `http://your-server-ip:3000`

## Docker Compose Services

The deployment includes two main services:

1. **PostgreSQL Database**
   - Container name: postgres
   - Port: 5432
   - Data persistence: Mounted volume for database files
   - Initialization: SQL scripts in the init-db directory

2. **Catalog Builder Application**
   - Container name: app
   - Port: 3000
   - Depends on: PostgreSQL database
   - Volumes:
     - PDF storage: Persists generated catalog PDFs
     - Uploads: Stores uploaded product images
     - Logs: Application logs for troubleshooting

## Important Directories

The deployment creates several directories for data persistence:

- `postgres_data/`: PostgreSQL database files
- `pdf_storage/`: Generated catalog PDFs and HTML files
- `uploads/`: Uploaded product images
- `logs/`: Application logs

## Customization Options

### Custom Templates

To add custom templates to the deployment:

1. Place your template files in the `public/templates/custom/` directory:
   - Main template: `template-name.html`
   - Product template: `template-name-product.html`
   - Template thumbnail: `template-name.svg`

2. Restart the application:
   ```bash
   docker-compose restart app
   ```

### Database Initialization

To initialize the database with your own data:

1. Modify the SQL scripts in the `init-db/` directory.
2. Rebuild and restart the containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Production Considerations

### Security

1. Always change default passwords in the `.env.production` file
2. Consider using a reverse proxy (like Nginx) for SSL termination
3. Set appropriate file permissions for mounted volumes

### Backups

1. Regularly backup the PostgreSQL database:
   ```bash
   docker-compose exec postgres pg_dump -U postgres catalog_builder > backup.sql
   ```

2. Backup the uploaded files and generated PDFs:
   ```bash
   tar -czf uploads_backup.tar.gz uploads/
   tar -czf pdfs_backup.tar.gz pdf_storage/
   ```

### Scaling

For higher load scenarios:

1. Consider using a managed database service instead of the containerized PostgreSQL
2. Use container orchestration (like Kubernetes) for automatic scaling
3. Implement a caching layer for frequently accessed catalogs

## Common Issues and Solutions

### Database Connection Failures

If the application can't connect to the database:

1. Check that the PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```

2. Verify the database credentials in `.env.production`

3. Check the PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

### PDF Generation Issues

If PDF generation fails:

1. Check the application logs:
   ```bash
   docker-compose logs app
   ```

2. Verify that Puppeteer has enough resources allocated to the container

3. Try increasing container memory limits:
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 2G
   ```

## Managing the Deployment

### Stopping the Application

```bash
docker-compose down
```

### Viewing Logs

```bash
docker-compose logs -f
```

### Updating the Application

1. Pull the latest code changes
2. Rebuild and restart the containers:
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

### Accessing the Database

```bash
docker-compose exec postgres psql -U postgres -d catalog_builder
```

## Further Resources

- Docker Documentation: [https://docs.docker.com/](https://docs.docker.com/)
- Docker Compose Documentation: [https://docs.docker.com/compose/](https://docs.docker.com/compose/)
- PostgreSQL Documentation: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)

For detailed information about the application's template system, refer to the TEMPLATE_SYSTEM_GUIDE.md file.