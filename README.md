# SQL Training

Interactive PostgreSQL training app with hands-on challenges across beginner, intermediate, and advanced levels.

## Stack

- **Next.js 16** (App Router) · **Tailwind CSS v4**
- **tRPC v11** — end-to-end type safety
- **Drizzle ORM** · **PostgreSQL 16** in Docker
- **CodeMirror 6** — SQL editor with syntax highlighting

## Setup

**Prerequisites:** Docker, Node.js, pnpm

```bash
# 1. Start the database
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Run migrations & seed data
pnpm db:migrate
pnpm db:seed

# 4. Start the app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), enter your name, and start learning.

## Content

| Level | Topics | Challenges |
|---|---|---|
| Beginner | SELECT, WHERE, ORDER BY, Aggregations, GROUP BY, LIKE, NULL | 27 |
| Intermediate | JOINs, HAVING, Subqueries, UNION, CASE, Date functions | 27 |
| Advanced | Window functions, CTEs, Recursive CTEs, Self joins, EXPLAIN | 13 |

The training database is a realistic e-commerce + HR schema: `products`, `categories`, `customers`, `orders`, `order_items`, `employees`, `departments`, `suppliers`, `reviews`.

## Features

- **Learning path** — guided curriculum from easiest to hardest
- **Topic browser** — jump directly to any SQL concept
- **SQL editor** — CodeMirror with PostgreSQL highlighting, `Ctrl+Enter` to run
- **Answer validation** — results compared against the solution query (order-insensitive)
- **Progress tracking** — per challenge, per topic, per level
- Local-only, no authentication — username stored in localStorage

## Scripts

```bash
pnpm dev                  # Development server
pnpm build                # Production build
pnpm db:migrate           # Apply schema migrations
pnpm db:seed              # Seed training data + challenges
pnpm db:seed:training     # Seed sample data only
pnpm db:seed:challenges   # Seed topics + challenges only
pnpm db:studio            # Open Drizzle Studio
```
