# API Overview

Swagger is available locally at `http://localhost:3001/docs`.

## Public

- `GET /health` returns API and database health.
- `POST /auth/register` creates a user and session.
- `POST /auth/login` authenticates a user.
- `POST /auth/refresh` rotates refresh tokens.

## Authenticated

- `GET /auth/me` returns the current user.
- `POST /auth/logout` revokes active refresh tokens.
- `GET /boards` lists owned boards.
- `POST /boards` creates a board with default columns.
- `GET /boards/:id` returns an owned board with columns and tasks.
- `PATCH /boards/:id` updates an owned board.
- `DELETE /boards/:id` deletes an owned board.
- `POST /boards/:id/columns` creates a column.
- `PATCH /columns/:id` renames or repositions a column.
- `DELETE /columns/:id` removes an empty column.
- `POST /tasks` creates a task.
- `PATCH /tasks/:id` updates a task.
- `PATCH /tasks/:id/move` moves and reorders a task transactionally.
- `DELETE /tasks/:id` deletes a task and reindexes its column.

All authenticated domain endpoints enforce ownership in the backend.
