# Frontend Dockerfile
# Multi-stage build for production optimization

# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-main.conf /etc/nginx/nginx.conf

# Create non-root user (Alpine compatible)
RUN addgroup -g 1001 -S frontend-group && \
    adduser -S frontend-user -u 1001 -G frontend-group

# Create tmp directory for nginx PID and set permissions
RUN mkdir -p /tmp/nginx && \
    chown -R frontend-user:frontend-group /var/cache/nginx && \
    chown -R frontend-user:frontend-group /var/run && \
    chown -R frontend-user:frontend-group /var/log/nginx && \
    chown -R frontend-user:frontend-group /usr/share/nginx/html && \
    chown -R frontend-user:frontend-group /etc/nginx && \
    chown -R frontend-user:frontend-group /tmp/nginx

# Switch to non-root user
USER frontend-user

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]