# ====================================================================
# Multi-Stage Production Dockerfile for Reviewly Platform
# ====================================================================

# Step 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Step 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# Step 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy backend dependencies and compiled code
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY data/ ./data/

EXPOSE 4000

CMD ["node", "backend/dist/server.js"]
