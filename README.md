# Save Our Votes - MVP

An e-voting platform for university elections.

## Features

- Admin dashboard for managing elections
- Voter token-based authentication
- Real-time election results
- Custom branding per election
- Candidate profiles with photos and bios
- CSV voter import/export

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, MongoDB, Mongoose
- **Authentication**: Better Auth (admin), JWT tokens (voters)

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables (see `.env.example` files)

3. Run development servers:
```bash
# Backend (port 3001)
pnpm dev:server

# Frontend (port 3000)
cd apps/web && pnpm dev
```

## Project Structure

```
save-our-votes/
├── apps/
│   └── web/          # Next.js frontend
├── src/              # Express backend
└── package.json      # Monorepo root
```
