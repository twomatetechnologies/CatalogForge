#!/bin/bash

# Deployment script for Catalog Builder application

echo "Starting deployment process..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker before proceeding."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose before proceeding."
    exit 1
fi

# Create necessary directories
mkdir -p postgres_data
mkdir -p pdf_storage
mkdir -p logs

# Copy environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    echo ".env.production file does not exist."
    echo "Creating a default .env.production file..."
    cp .env .env.production
    echo "Please edit .env.production with appropriate production values before rerunning this script."
    exit 1
fi

# Build and start containers
echo "Building and starting Docker containers..."
docker-compose build
docker-compose up -d

echo "Deployment completed successfully!"
echo "Your application should now be running at http://localhost:3000"
echo "To view logs, run: docker-compose logs -f"
echo "To stop the application, run: docker-compose down"