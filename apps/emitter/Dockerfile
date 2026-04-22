FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.base.json nx.json ./
COPY apps/emitter apps/emitter
RUN npx nx build emitter

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist/apps/emitter ./dist/apps/emitter
CMD ["node", "dist/apps/emitter/src/main.js"]
