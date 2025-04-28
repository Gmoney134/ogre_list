
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first
# This leverages Docker cache - dependencies are only re-installed if these files change
COPY ./app/frontend/package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the frontend application code
# This assumes your frontend code is in './app/frontend' relative to docker-compose.yml
COPY ./app/frontend .

# Declare the build argument that will receive the URL from docker-compose
ARG NEXT_PUBLIC_API_URL

# Set the environment variable FROM the build argument
# This makes it available to the 'next build' command below
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the Next.js application for production
# Ensure your next.config.js is set up for standalone output if using CMD ["node", "server.js"]
RUN npm run build

# Set environment to production for runtime
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
# If using standalone output (output: 'standalone' in next.config.js), use "node server.js"
# Otherwise, you might use "npm start" which typically runs "next start"
CMD ["npm", "start"]