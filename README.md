# PM Kanban Board

A modern project management kanban board built with Next.js, Express, Socket.io, and Drizzle ORM.

## Prerequisites

- **Node.js**: v18 or later
- **pnpm**: v10 or later
- **Docker**: For running PostgreSQL locally

## Getting Started

Follow these steps to set up the project locally.

### 1. Database Setup

We use Docker to run PostgreSQL 18.1. Run the following command in your terminal to start the database container:

```bash
docker run -d \
  --name postgresql \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kanban \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql \
  postgres:18.1
```

### 2. Backend Setup

1.  **Navigate to the backend directory**:

    ```bash
    cd backend
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file from the example:

    ```bash
    cp .env.example .env
    ```

    Open `.env` and ensure the `DB_URL` matches your Docker setup:
    `DB_URL=postgresql://postgres:postgres@localhost:5432/kanban`

    _Note: You may also need to configure other variables like `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, etc., for full functionality._

4.  **Run database migrations**:

    ```bash
    pnpm db:generate
    pnpm db:migrate
    ```

5.  **Start the development server**:
    ```bash
    pnpm dev
    ```
    The backend will run on `http://localhost:5000`.

### 3. Frontend Setup

1.  **Navigate to the frontend directory**:

    ```bash
    cd frontend
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file:

    ```bash
    echo "NEXT_PUBLIC_API_URL='http://localhost:5000/api'" > .env
    ```

4.  **Start the development server**:
    ```bash
    pnpm dev
    ```
    The frontend will run on `http://localhost:3000`.

---

## Useful Commands

### Docker (PostgreSQL)

- **Stop the database**: `docker stop postgresql`
- **Start the database (if already created)**: `docker start postgresql`
- **Check container status**: `docker ps`

### Backend

- **DB Studio**: `pnpm db:studio` (Visualize your database)
- **New Migration**: `pnpm db:generate --name your_migration_name`
