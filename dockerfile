# 1. Use an official Node.js runtime as a parent
FROM node:latest

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of your code
COPY . .

# 6. Build the Next.js app
RUN npm run build

# 7. Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
