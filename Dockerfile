# Use Node 20 as the base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy root package.json for build scripts
COPY package*.json ./

# Copy client and server package.json files first (for efficient caching)
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies and build the frontend (using the root gcp-build script)
COPY . .
RUN npm run gcp-build

# Expose the port (Cloud Run sets process.env.PORT)
EXPOSE 8080

# Start the server
CMD [ "npm", "start" ]
