# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors for caching dependencies
COPY nodemesh-app/package.json nodemesh-app/package-lock.json ./nodemesh-app/

# Install dependencies
RUN npm ci --prefix nodemesh-app

# Copy the rest of the application files
COPY nodemesh-app/ ./nodemesh-app/

# Build the Angular application in production mode
RUN npm run build --prefix nodemesh-app

# Stage 2: Serve the application using Nginx Alpine
FROM nginx:alpine

# Copy built application from Stage 1
COPY --from=build /app/nodemesh-app/dist/nodemesh-app/browser /usr/share/nginx/html

# Copy Nginx custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
