

# Use Node.js LTS as the base image
FROM node:23-alpine
# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
# This allows Docker to cache the npm install step if these files don't change
COPY package*.json ./
RUN cat package.json 
# Install dependencies
RUN npm install

# Then copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "src/index.js"]