# AGENTS.md

**answer korean**

This file provides guidance to AI coding assistants when working with this repository.

## Project Overview

**CotePT** is a 1:1 mentoring platform with real-time collaboration features built as a Turborepo monorepo.

- **Backend**: NestJS + Hexagonal Architecture + TypeORM + Oracle DB
- **Frontend**: Next.js 15 (App Router) + React 19 + React Query + Tailwind CSS v4
- **Package Manager**: pnpm 8.15.6 (enforced)
- **Node.js**: >= 18

## Repository Structure

```
apps/
├── api/              # NestJS backend (port 3001)
└── web/              # Next.js frontend (port 3000)
packages/
├── api-client/       # Auto-generated OpenAPI TypeScript client
├── shared/           # Shared UI components & utilities
├── typescript-config/# Shared TypeScript configurations
└── eslint-config/    # Shared ESLint configurations
```

## Essential Commands

```bash
# Infrastructure
pnpm infra:up         # Start Oracle DB, Redis (Docker)
pnpm infra:up:arm64   # ARM64 variant for M1/M2 Macs

# Development
pnpm dev              # Start all apps
pnpm dev:api          # API only (http://localhost:3001)
pnpm dev:web          # Web only (http://localhost:3000)

# API Client
pnpm gen:api          # Regenerate after backend changes

# Quality
pnpm build            # Build all packages
pnpm lint             # Lint all
pnpm typecheck        # TypeScript check
pnpm test             # Run all tests
```

## Architecture Overview

### Backend: Hexagonal Architecture

**Layer Rules** (Dependency Direction: Infrastructure → Application → Domain)

- **Domain**: Pure business logic, no framework dependencies
- **Application**: Orchestrates domain, defines ports (interfaces)
- **Infrastructure**: Implements ports, handles I/O (HTTP, DB, APIs)

**Critical**: Domain never imports from Application/Infrastructure. Use Mappers explicitly.

📖 **Detailed Guide**: `@docs/guides/backend-architecture.md`

### Frontend: Feature-Sliced Design (FSD)

**Layer Rules** (Dependency Direction: packages → shared → features → containers → app)

- **shared/**: No dependencies on features or containers
- **features/**: Domain-specific logic, can import from shared only
- **containers/**: Compose multiple features
- **app/**: Routes only, delegates to containers

📖 **Detailed Guide**: `@docs/guides/frontend-architecture.md`

## Design System (Tailwind CSS v4)

### Color Tokens

- **Primitives**: Tailwind zinc palette (50-950)
- **Semantic**: `primary`, `secondary`, `tertiary`, `success`, `warning`, `destructive`, `info`
- **Layered**: `bg-background~5`, `fg-fg-1~4`, `border-border-1~3`

### Guidelines

- ❌ Never use hardcoded colors (`bg-zinc-700`)
- ✅ Use semantic tokens (`bg-primary`, `text-fg-2`, `bg-bg-4`)
- ✅ Brand colors support `tint` and `shade` variants

📖 **Detailed Guide**: `@docs/guides/design-system.md`

## Common Workflows

### Adding a New API Endpoint

1. Backend: Define DTO → UseCase interface → Implement service → Add controller
2. Generate client: `pnpm gen:api`
3. Frontend: Create React Query mutation/query → Use generated client

### Adding a New Feature

1. Backend: `pnpm create:module <name>` → Implement hexagonal layers → Add migrations
2. Frontend: Create `features/<name>/` → Add api/hooks/schemas/components
3. Integration: `pnpm gen:api` → Create container → Add route

📖 **Detailed Guide**: `@docs/guides/development-workflow.md`

## Code Style

- **Prettier**: 120 width, no semicolons, double quotes, trailing commas
- **TypeScript**: Strict mode, path aliases (`@/*`, `@repo/*`)
- **ESLint**: Boundaries plugin enforces layer dependencies

## Key Integrations

- **Auth**: NextAuth.js (frontend) + Passport (backend)
- **Real-time**: LiveKit (WebRTC), Socket.IO (WebSocket), Y.js (collaborative editing)
- **Database**: Oracle (TypeORM), Redis
- **Cloud**: OCI (Object Storage, Functions)

## Troubleshooting

```bash
# Database issues
pnpm infra:up && cd apps/api && pnpm migration:run

# API client out of sync
pnpm gen:api

# Type errors after updates
pnpm clean && pnpm build

# Port conflicts
lsof -ti:3001 | xargs kill -9  # API
lsof -ti:3000 | xargs kill -9  # Web
```

📖 **Detailed Guide**: `@docs/guides/troubleshooting.md`

## Additional Resources

- **Engineering Guide**: `@ENGINEERING_GUIDE.md`
- **Business Rules**: `@docs/business-rules.md`
- **Backend Architecture**: `@docs/guides/backend-architecture.md`
- **Frontend Architecture**: `@docs/guides/frontend-architecture.md`
- **Design System**: `@docs/guides/design-system.md`
- **Development Workflow**: `@docs/guides/development-workflow.md`
