# Backend foundation

This directory contains the first runnable backend slice.

## Run locally

```bash
cp ../.env.example .env
npm install
npm run start:dev
```

The health endpoint is available at `http://localhost:3000/v1/health`.

## Start dependencies

```bash
docker compose -f docker-compose.yml up -d
```

The current slice intentionally contains only application bootstrap, security middleware, configuration loading, validation, and a health endpoint. Authentication, persistence, and domain modules will be added as tested vertical slices rather than represented by mock endpoints.
