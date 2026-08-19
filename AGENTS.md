# DevBoard Agent Guide

## Overview

DevBoard is a pnpm workspace with a Next.js frontend in `apps/web` and a NestJS REST API in `apps/api`. PostgreSQL is accessed through Prisma from the API only.

## Commands

- `pnpm install` installs all workspaces.
- `docker compose up -d` starts PostgreSQL.
- `pnpm prisma:migrate` runs Prisma migrations from the API workspace.
- `pnpm prisma:seed` loads demo data.
- `pnpm dev` runs web and API in development.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` validate the monorepo.

## Structure

- `apps/api/src/auth` owns authentication, JWTs and sessions.
- `apps/api/src/boards`, `columns`, `tasks` own Kanban domain rules.
- `apps/api/src/prisma` owns Prisma lifecycle.
- `apps/web/app` contains App Router pages and UI components.
- `docs` contains architecture, database and API notes.

## Backend Rules

- Controllers stay thin; services enforce ownership and business behavior.
- Never trust frontend authorization. Every board, column and task mutation must validate ownership through the database.
- Never store refresh tokens in plain text; only persist hashes.
- Use DTO validation for request bodies.

## Frontend Rules

- Server data goes through TanStack Query.
- Forms use React Hook Form and Zod.
- Keep UI states explicit: loading, error, empty and success feedback.
- Do not add global state unless cross-page UI state requires it.

## Tests

- API tests cover auth, ownership, board and task flows.
- Web tests cover forms and core board UI behavior.

## Database

- Use Prisma migrations, not `prisma db push`, for lasting schema changes.
- Preserve ordering with numeric `position` fields on columns and tasks.

## Do Not

- Do not commit secrets or `.env` files.
- Do not bypass lint, typecheck or tests with `|| true`.
- Do not add Kafka, Redis, microservices, CQRS or other out-of-scope systems.

## Definition of Done

A change is ready only when lint passes, typecheck passes, tests pass, build passes, no secrets are present, and no known errors are ignored.
