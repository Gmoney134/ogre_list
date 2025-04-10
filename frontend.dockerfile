# Use an appropriate Node.js base image
FROM node:20-alpine AS base

 # Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json from the frontend directory
COPY ./app/frontend/package*.json ./
# --- Builder Stage ---
# Used for installing dependencies and building the application
FROM base AS builder

# Copy package.json and package-lock.json (or yarn.lock) first
# This leverages Docker cache - dependencies are only re-installed if these files change
COPY ./app/frontend/package*.json ./

 # Install dependencies
RUN npm install

 # Copy the rest of the frontend application code to the working directory
COPY ./app/frontend .

# Ensure Next.js binary is executable
RUN chmod +x node_modules/.bin/next
# Declare the build argument that will receive the URL from docker-compose
ARG NEXT_PUBLIC_API_URL

# Set the environment variable FROM the build argument
# This makes it available to the 'next build' command below
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

 # Build the application
# Ensure your next.config.js is set up for standalone output: output: 'standalone'
RUN npm run build

# --- Production Stage ---
# Final, smaller image containing only the built app and necessary runtime files
FROM base AS production

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
# Set the API URL again for runtime access (needed by the standalone server.js)
# It uses the ARG value inherited from the builder stage context
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy necessary files from the builder stage for standalone output
# Adjust ownership to a non-root user if you create one
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

 # Expose the port your app runs on
EXPOSE 3000

# Optional: Create and use a non-root user for better security
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
# USER nextjs

# Use the Node.js server created by the standalone output
CMD ["node", "server.js"]
