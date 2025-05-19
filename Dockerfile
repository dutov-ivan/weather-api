# -------- Base Stage --------
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# -------- Dependencies --------
FROM base AS deps
RUN npm install

# -------- Builder (for production only) --------
FROM deps AS builder
COPY . .
RUN npm run build

# -------- Production Image --------
FROM node:22-alpine AS prod
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main"]

# -------- Development Image --------
FROM node:22-alpine AS dev
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source files
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
