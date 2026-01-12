# Save Our Votes - Frontend

Next.js frontend for the Save Our Votes e-voting platform.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your values:
- `BETTER_AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `BETTER_AUTH_URL`: `http://localhost:3000` (or your domain)
- `MONGODB_URI`: Your MongoDB connection string
- `NEXT_PUBLIC_API_URL`: Express API URL (default: `http://localhost:3001/api`)

4. Run development server:
```bash
pnpm dev
```

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Better Auth (MongoDB adapter)
- Tailwind CSS
- shadcn/ui
- Zod

## Project Structure

```
apps/web/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   └── lib/
│       ├── auth/        # Better Auth config
│       └── schemas/     # Zod schemas
└── components.json      # shadcn/ui config
```
