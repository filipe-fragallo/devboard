# Database

DevBoard uses PostgreSQL with Prisma migrations.

```mermaid
erDiagram
  User ||--o{ Board : owns
  User ||--o{ RefreshToken : has
  Board ||--o{ Column : contains
  Column ||--o{ Task : contains

  User {
    string id PK
    string name
    string email UK
    string passwordHash
    string avatarUrl
  }
  Board {
    string id PK
    string name
    string ownerId FK
  }
  Column {
    string id PK
    string name
    int position
    string boardId FK
  }
  Task {
    string id PK
    string title
    Priority priority
    datetime dueDate
    int position
    string columnId FK
  }
  RefreshToken {
    string id PK
    string tokenHash
    datetime expiresAt
    datetime revokedAt
  }
```

## Modeling Decisions

- `Board.ownerId` is indexed because every board query is scoped by user.
- `Column.boardId, position` and `Task.columnId, position` are indexed to keep ordered Kanban reads efficient.
- Cascading deletes keep child columns/tasks/session rows from becoming orphaned.
- Refresh tokens store only Argon2 hashes, never plaintext token values.
