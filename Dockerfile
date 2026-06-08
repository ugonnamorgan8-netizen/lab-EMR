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

# Generate Prisma client
RUN cd server && npx prisma generate

# Build the client (React/Vite)
RUN npm run build --workspace=client

# Hugging Face Spaces requires the app to run on port 7860
ENV PORT=7860
# SQLite database path inside the container
ENV DATABASE_URL="file:/app/server/prisma/dev.db"
EXPOSE 7860

# Hugging Face requires the container to run as a non-root user.
RUN chown -R node:node /app
USER node

# Start: push schema, seed if needed, then start the server with tsx (no tsc compilation needed)
CMD ["sh", "-c", "cd /app/server && npx prisma db push --accept-data-loss && npx tsx prisma/maybeSeed.ts && npx tsx src/index.ts"]
