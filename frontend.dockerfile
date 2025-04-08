# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json from the frontend directory
COPY ./app/frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application code to the working directory
COPY ./app/frontend .

# Ensure Next.js binary is executable
RUN chmod +x node_modules/.bin/next

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]