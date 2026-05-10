FROM node:20-alpine AS build


WORKDIR /frontend

# Install deps first
COPY src/frontend/package.json src/frontend/package-lock.json* ./
RUN npm ci

# Copy sources
COPY src/frontend ./

# Bud static dir (see vite.config.ts outDir: '../static')
RUN npm run build

# Final stage: export artifacts.
# Vite copies build output into the filesystem path set by `outDir`.
# In our repo `outDir: '../static'` relative to `src/frontend` => `src/static`.
FROM alpine:3.20
WORKDIR /frontend-out

# The build stage's workdir is /frontend, so src/frontend/static is /frontend/static
# But Vite's outDir points one level up => /frontend/../static.
# We'll copy everything under that directory.
COPY --from=build /static ./



