# bt-auth

Auth project to learn from the ground up
Deployed at: https://auth.bjorntirsen.se/

## QuickStart

Requirements:

- Node.js
- pnpm
- Docker

1. Clone the project
2. Run `pnpm install`
3. Run `pnpm db:start`
4. Copy `server/.env.example` to `server/.env` by running `cp server/.env.example server/.env` in the terminal.
5. Run `pnpm dev`

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
- [ ] Add Docker Compose for local Postgres
- [ ] Add DB connection + client setup
- [ ] Add schema + migrations
- [ ] Wire DB into BFF

### V2 — OAuth2

### V3 — PKCE

### V4 — OIDC
