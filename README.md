# cabri

AI-powered cron job automation. Describe tasks in natural language and Cabri creates scheduled jobs with configurable steps (HTTP requests, conditions, email).

Built with LangChain agents, Drizzle ORM (SQLite), and Bun.

## Setup

```bash
bun install
```

Create a `.env` file:

```env
DB_FILE_NAME=file:cabri.db
GROQ_API_KEY=your_groq_api_key
```

Run database migrations:

```bash
bunx drizzle-kit push
```

## Usage

```bash
bun run index.ts
```

## Step Types

- **HTTP_REQUEST** — Make HTTP GET/POST requests on a schedule
- **CONDITION** — Evaluate expressions to control job flow
- **SEND_MAIL** — Send emails with configurable to/subject/body
