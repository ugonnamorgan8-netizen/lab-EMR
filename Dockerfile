# Use Node.js 20 as the base image
FROM node:20

# Create and set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies (including devDependencies for tsx and prisma)
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client (cd into server to run it directly)
RUN cd server && npx prisma generate

# Build both client and server workspaces
RUN npm run build --workspace=client
RUN cd server && npm run build

# Hugging Face Spaces requires the app to run on port 7860
ENV PORT=7860
EXPOSE 7860

# Hugging Face requires the container to run as a non-root user.
RUN chown -R node:node /app
USER node

# Start command: push schema, conditionally seed, and start the server
CMD ["sh", "-c", "cd server && npx prisma db push --accept-data-loss && npm run seed:maybe && cd /app && npm start"]
