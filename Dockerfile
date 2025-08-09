# Production Dockerfile for Dichoptic Therapy Games
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Run production checks
RUN npm run production-check

# Production stage
FROM nginx:alpine

# Install Node.js for health checks
RUN apk add --no-cache nodejs npm

# Copy built application
COPY --from=builder /app /usr/share/nginx/html

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy health check script
COPY docker/healthcheck.js /usr/local/bin/healthcheck.js
RUN chmod +x /usr/local/bin/healthcheck.js

# Add labels for better container management
LABEL maintainer="Tal Bar Nizan & Ori Nizan"
LABEL version="1.2.0"
LABEL description="Production-ready dichoptic therapy games"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /usr/local/bin/healthcheck.js

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
