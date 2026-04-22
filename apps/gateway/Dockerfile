FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.base.json nx.json ./
COPY apps/gateway apps/gateway
RUN npx nx build gateway

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist/apps/gateway ./dist/apps/gateway
CMD ["node", "dist/apps/gateway/src/main.js"]
