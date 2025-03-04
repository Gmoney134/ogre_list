# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json to the working directory
COPY ./app/backend/package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY ./app/backend ./

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["node", "build/server.js"]