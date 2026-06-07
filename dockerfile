# syntax=docker/dockerfile:1

# ---- Stage 1: build ----
FROM node:24-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Copy manifests first for layer caching — deps only reinstall when these change
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install all deps (incl. dev — needed to build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the rest of the source and build both packages
COPY . .
RUN pnpm -r build

# ---- Stage 2: runtime ----
FROM node:24-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Recreate the workspace structure the runtime path logic expects:
#   server/dist/index.mjs  resolves  ../../client/dist
COPY --from=build /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=build /app/server/package.json ./server/
COPY --from=build /app/client/package.json ./client/

# Install ONLY production deps for the server
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built artifacts into the layout the server expects
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/client/dist ./client/dist

EXPOSE 3000
CMD ["node", "server/dist/index.mjs"]