FROM node:20-slim AS base

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copy app source
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

FROM node:20-slim AS production

WORKDIR /app

# Copy from build stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/public ./public
COPY --from=base /app/uploads ./uploads
COPY --from=base /app/package.json ./

# Create directories for generated files
RUN mkdir -p public/generated
RUN mkdir -p uploads

# Create volumes for persistent data
VOLUME /app/public/generated
VOLUME /app/uploads

# Install only production dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxshmfence1 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["node", "dist/server/index.js"]