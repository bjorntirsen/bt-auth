# bt-auth

Auth project to learn from the ground up
Deployed at: https://auth.bjorntirsen.se/

## Quick Start

Requirements:

- Node.js
- pnpm
- Docker

1. Start Docker.
2. Clone the project
3. Run `pnpm install`
4. Copy `.env.example` to `.env`:

```bash
  cp .env.example .env
```

5. Run `pnpm db:start`
6. Run `pnpm dev`

Useful database commands:

- `pnpm db:psql` — open a PostgreSQL shell
- `pnpm db:logs` — follow PostgreSQL logs
- `pnpm db:stop` — stop PostgreSQL while preserving data
- `pnpm db:reset` — delete the local database and start fresh

## Plan

### V1 — Identity Server 🏗️ IN PROGRESS

- [x] Clean up Vite boilerplate
- [x] Add oxlint and oxfmt config
- [x] Add Vitest setup with initial test
- [x] Add pre-commit hooks (lint-staged)
- [x] Add CI workflow (lint, test, build)
- [x] Add deploy workflow

- [x] Add Docker Compose for local Postgres
- [x] Add Drizzle setup
- [x] Add database health check

- [ ] Define initial schema
- [ ] Generate first migration
- [ ] Provision production Postgres
- [ ] Configure production environment
- [ ] Run production migrations

- [ ] Persist users

### V2 — OAuth2

### V3 — PKCE

### V4 — OIDC
