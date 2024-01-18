# Use an official Node runtime as a parent image
FROM node:20.9.0-alpine3.18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package.json pnpm-lock.yaml ./

# Install app dependencies
RUN npm install -g pnpm
RUN pnpm i

# Bundle app source
COPY . .

# Build TypeScript code
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "start:prod"]