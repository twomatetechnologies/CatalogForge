#!/bin/bash

# Development script for Catalog Builder application

# Set environment
ENV=${1:-development}
echo "Starting development environment..."

# Load environment variables
if [ -f ".env.$ENV" ]; then
  echo "Loading environment from .env.$ENV"
  set -a
  source .env.$ENV
  set +a
else
  echo "Using default .env file"
  set -a
  source .env
  set +a
fi

# If .env.local exists, load it to override settings
if [ -f ".env.local" ]; then
  echo "Loading local overrides from .env.local"
  set -a
  source .env.local
  set +a
fi

# Start the development server
npm run dev