# Pixora

Turn Moments Into Keepsakes — a modern photo personalization platform.

## Monorepo Structure

| Workspace | Description | Port |
|-----------|-------------|------|
| `apps/web` | Customer storefront + editor | 3000 |
| `apps/admin` | Internal admin dashboard | 3001 |
| `apps/mobile` | Expo mobile app | — |
| `packages/ui` | shadcn/ui design system | — |
| `packages/shared` | Types, schemas, constants | — |
| `packages/api` | Supabase clients + queries | — |
| `packages/providers` | Stripe, Resend, fulfilment stubs | — |

## Getting Started

```bash
pnpm install
cp .env.example apps/web/.env.local
pnpm dev
```

## Scripts

- `pnpm dev` — Start all apps in development
- `pnpm build` — Build all apps and packages
- `pnpm lint` — Lint all workspaces
- `pnpm typecheck` — Type-check all workspaces
- `pnpm format` — Format with Prettier

## Tech Stack

Next.js 15 · Expo · TypeScript · Tailwind · shadcn/ui · Supabase · Stripe · Turborepo

See [docs/MASTER_CONTEXT.md](docs/MASTER_CONTEXT.md) for product vision and brand guidelines.
