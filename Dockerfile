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

# Generate Prisma client (PostgreSQL provider)
RUN cd server && npx prisma generate

# Build the client (React/Vite)
RUN npm run build --workspace=client

# Verify client dist was built correctly
RUN ls -la /app/client/dist/

# Hugging Face Spaces requires the app to run on port 7860
ENV PORT=7860
# DATABASE_URL must be set at runtime via HF Space secrets (PostgreSQL connection string)
# e.g. postgresql://user:pass@host:5432/dbname
ENV ENABLE_DEMO_SEED=true

EXPOSE 7860

# Hugging Face requires the container to run as a non-root user.
RUN chown -R node:node /app
USER node

# Start: push schema to PostgreSQL, optionally seed demo data, then start server
CMD ["sh", "-c", "cd /app/server && echo '==> Pushing DB schema...' && npx prisma db push --accept-data-loss && echo '==> Running seed if needed...' && npx tsx prisma/maybeSeed.ts && echo '==> Starting server...' && npx tsx --tsconfig tsconfig.json src/index.ts"]
