# Build stage
FROM node:23-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
# The problem was trying to copy from "../package*.json" which is outside your build context
COPY package*.json ./

# List files to debug
RUN ls -la

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Update the environment variable to use the nginx proxy path
RUN echo "VITE_API_URL=" > .env.production

# Build the application
RUN npm run build

# Production stage - use a lightweight server
FROM node:23-alpine AS production

# Set working directory
WORKDIR /app

# Install serve to host static files
RUN npm install -g serve

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 5000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/ || exit 1

# Start the server
CMD ["serve", "-s", "dist", "-l", "5000"]