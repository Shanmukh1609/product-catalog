# Stage 1: Use an official Node.js image to build our application
FROM node:20-alpine AS builder

#It will create working directory where all the files 'd be inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This leverages Docker's layer caching. If these files don't change,
# Docker won't re-run 'npm install' on subsequent builds.
COPY package*.json ./

# Run npm install to install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Use a lightweight Node.js image to run the application
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy only the built artifacts from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app .

# Expose the port your app runs on
EXPOSE 3000

# The command to run your application
CMD [ "npm", "start" ]
