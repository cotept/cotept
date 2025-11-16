# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CotePT** is a 1:1 mentoring platform with real-time collaboration features built as a Turborepo monorepo.

- **Backend**: NestJS with hexagonal architecture + TypeORM + Oracle DB
- **Frontend**: Next.js 15 (App Router) + React 19 + React Query + Tailwind CSS
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

### Development Workflow
```bash
# Infrastructure (run first)
pnpm infra:up         # Start Oracle DB, Redis, NoSQL (Docker)
pnpm infra:up:arm64   # ARM64 variant for M1/M2 Macs

# Development servers
pnpm dev              # Start all apps in watch mode
pnpm dev:api          # API only (http://localhost:3001)
pnpm dev:web          # Web only (http://localhost:3000)

# Build & Quality
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm typecheck        # TypeScript check all packages
pnpm test             # Run all tests
```

### Backend Commands (apps/api)
```bash
cd apps/api

# Development
pnpm dev                      # Watch mode (auto-runs migrations)
pnpm build                    # Production build

# Database
pnpm migration:generate       # Generate migration from entity changes
pnpm migration:run            # Apply pending migrations
pnpm migration:revert         # Rollback last migration

# Module Creation
pnpm create:module <name>     # Generate hexagonal architecture module

# Testing
pnpm test                     # Unit tests
pnpm test:watch               # Watch mode
pnpm test:cov                 # Coverage report
pnpm test:e2e                 # E2E tests
pnpm test:module <name>       # Test specific module
```

### Frontend Commands (apps/web)
```bash
cd apps/web

# Development
pnpm dev                      # Dev server
pnpm build                    # Production build
pnpm start                    # Start production server

# Testing & Documentation
pnpm test                     # Vitest unit tests
pnpm test:watch               # Watch mode
pnpm storybook                # Storybook dev server
pnpm build-storybook          # Build Storybook
```

### API Client Generation
```bash
# From root - regenerate API client after backend changes
pnpm gen:api                  # Export OpenAPI spec → Generate TypeScript client
```

**Important**: Run this whenever you modify API endpoints or DTOs to keep the frontend client in sync.

## Backend Architecture: Hexagonal (Ports & Adapters)

All backend modules strictly follow hexagonal architecture with clear layer separation.

### Module Structure
```
modules/<domain>/
├── domain/
│   ├── model/           # Entities & business entities
│   └── vo/              # Value Objects (immutable)
├── application/
│   ├── dtos/            # Data Transfer Objects
│   ├── ports/           # Inbound & Outbound Interfaces
│   │   ├── in/          # UseCases (called by controllers)
│   │   └── out/         # Repository/Service interfaces
│   ├── services/        # UseCase implementations & Facades
│   └── mappers/         # Domain ↔ DTO conversion
└── infrastructure/
    └── adapter/
        ├── in/          # Controllers (HTTP)
        └── out/         # Repositories, External Services
```

### Layer Rules (STRICTLY ENFORCED)

**Dependency Direction**: Infrastructure → Application → Domain

- **Domain Layer**: Pure business logic, no framework dependencies
- **Application Layer**: Orchestrates domain logic, defines ports (interfaces)
- **Infrastructure Layer**: Implements ports, handles I/O (HTTP, DB, external APIs)

**Critical Rules**:
1. Domain NEVER imports from Application or Infrastructure
2. Application NEVER imports from Infrastructure
3. Infrastructure depends on both Application (ports) and Domain (entities)
4. Use Mappers explicitly - never pass domain entities to controllers or DTOs to domain

### Development Workflow (Endpoint-First)

1. Define API contract with Swagger decorators in controller
2. Write tests (TDD approach)
3. Implement Domain layer (entities, value objects, business rules)
4. Define Application layer (UseCases as interfaces in `ports/in/`, implement in `services/`)
5. Define Outbound ports (interfaces in `ports/out/`)
6. Implement Infrastructure layer (controllers call UseCases, repositories implement outbound ports)
7. Generate API client: `pnpm gen:api`

### Example: Creating a New Feature

```bash
# 1. Generate module structure
cd apps/api
pnpm create:module my-feature

# 2. Implement layers (domain → application → infrastructure)
# 3. Add migrations if needed
pnpm migration:generate

# 4. Run migrations
pnpm migration:run

# 5. Test
pnpm test:module my-feature

# 6. Generate API client for frontend
cd ../..
pnpm gen:api
```

## Frontend Architecture: Feature-Sliced Design (FSD)

The frontend follows FSD-inspired organization with strict dependency rules.

### Directory Structure (apps/web/src)
```
app/               # Next.js App Router (routes only)
├── (auth)/        # Auth route group
└── (main)/        # Main app route group

containers/        # Page-level composition (assembles features)
├── auth/
└── mentoring/

features/          # Domain-specific business logic
├── auth/          # Authentication
├── onboarding/    # Onboarding flow
├── mentor/        # Mentor features
├── user/          # User management
└── user-profile/  # User profiles

shared/            # Reusable components & utilities
├── ui/            # shadcn/ui components
├── lib/           # Utility functions
├── hooks/         # Custom React hooks
└── types/         # Shared TypeScript types
```

### Feature Structure Pattern
```
features/<domain>/
├── api/
│   ├── mutations.ts    # React Query mutations
│   └── queries.ts      # React Query queries
├── hooks/              # Custom hooks (useFeatureName)
├── schemas/            # Zod validation schemas
├── types/              # TypeScript types
└── components/         # Feature-specific components
```

### Layer Rules

**Dependency Direction**: packages → shared → features → containers → app

- **shared/**: No dependencies on features or containers
- **features/**: Can import from shared, not from other features
- **containers/**: Compose multiple features
- **app/**: Routes only, delegates to containers

### Frontend Development Workflow

1. Define Zod schema for validation (`schemas/`)
2. Create API functions using React Query (`api/mutations.ts`, `api/queries.ts`)
3. Build custom hooks for business logic (`hooks/`)
4. Create feature components (`components/`)
5. Compose in containers (`containers/`)
6. Add route in app router (`app/`)

### React Query Patterns

Use query-key-factory for type-safe query keys:

```typescript
// features/user/api/queries.ts
import { createQueryKeys } from '@lukemorales/query-key-factory'

export const userQueries = createQueryKeys('user', {
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: () => userApi.getUser(id),
  }),
})

// Usage in component
const { data } = useQuery(userQueries.detail(userId))
```

## Shared Packages

### @repo/shared (packages/shared)

ESM module with shared UI components, hooks, and utilities.

**Exports**:
- `@repo/shared/globals.css` - Global styles
- `@repo/shared/lib/*` - Utility functions
- `@repo/shared/components/*` - Reusable UI components
- `@repo/shared/hooks/*` - Shared React hooks
- `@repo/shared/types/*` - Shared types

**Key Features**:
- shadcn/ui component library (unstyled, accessible Radix UI primitives)
- TipTap rich text editor
- Form components with React Hook Form + Zod
- Business rule helpers (`rules/`)

### @repo/api-client (packages/api-client)

Auto-generated OpenAPI TypeScript Axios client.

**Generation Process**:
1. Backend exports OpenAPI spec (`openapi-spec.yaml`)
2. OpenAPI Generator creates TypeScript Axios client
3. Custom script extracts enums

**Regenerate**: `pnpm gen:api` (run after any API changes)

## Database Management

### TypeORM Workflow

```bash
# After modifying entities
pnpm migration:generate  # Auto-generates migration

# Review generated migration in:
# apps/api/src/shared/infrastructure/persistence/migrations/

# Apply migration
pnpm migration:run

# If needed, rollback
pnpm migration:revert
```

**Migration Location**: `apps/api/src/shared/infrastructure/persistence/migrations/`

**Config**: `apps/api/src/configs/typeorm/typeorm.cli.config.ts`

## Authentication

### Backend (NestJS + Passport)
- **Strategies**: Local (username/password), Google OAuth2, GitHub OAuth2
- **JWT**: Token-based authentication with configurable expiry
- **Guards**: JWT guards protect routes
- **Module**: `apps/api/src/modules/auth/`

### Frontend (NextAuth.js)
- **Version**: 5.0.0-beta.29
- **Providers**: Credentials, Google, GitHub
- **Session**: JWT-based sessions
- **Middleware**: Route protection in `middleware.ts`

## Real-Time Features

### Technologies
- **WebRTC**: LiveKit SFU for audio/video
- **WebSocket**: Socket.IO for signaling
- **Collaborative Editing**: Y.js for code editor synchronization
- **Streaming**: HLS.js for VOD playback (multi-bitrate)

### Media Pipeline
1. LiveKit captures session (audio/video/screen)
2. LiveKit Egress exports to OCI Object Storage
3. OCI Functions (ffmpeg) transcodes to HLS (1080p/720p/480p)
4. Frontend streams via HLS.js

## Code Style

### Prettier (enforced)
- Print width: 120
- No semicolons
- Double quotes
- Trailing commas: all
- Tailwind CSS class sorting enabled

### TypeScript
- Strict mode enabled
- Path aliases:
  - `@/*` → `./src/*` (api & web)
  - `@repo/*` → `../../packages/*` (web)

### ESLint
- Boundaries plugin enforces layer dependencies
- Import sorting
- Unused imports detection
- Framework-specific rules (NestJS, Next.js)

## Testing Strategy

### Backend (Jest)
- **Unit Tests**: Alongside source files (`*.spec.ts`)
- **E2E Tests**: `apps/api/test/` directory
- **Coverage**: `pnpm test:cov` generates report
- **Mocking**: Use Jest mocks for external dependencies

### Frontend (Vitest + Playwright)
- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright for browser automation
- **Storybook**: Component documentation and visual testing

## Key Integrations

### External APIs
- **Baekjoon**: Korean coding platform integration (`modules/baekjoon/`)
- **Google OAuth2**: Social authentication
- **GitHub OAuth2**: Social authentication
- **LiveKit**: WebRTC SFU (audio/video/screen sharing)

### Cloud Services (OCI)
- **Autonomous Database**: Primary RDBMS (Oracle)
- **NoSQL Database**: Session storage
- **Object Storage**: VOD media files
- **Functions**: Media transcoding (ffmpeg)

## Environment Configuration

### Required Environment Variables

**Backend** (`apps/api/.env`):
- Database connection (Oracle)
- Redis connection
- JWT secrets
- OAuth2 credentials (Google, GitHub)
- OCI credentials
- LiveKit API keys
- Mail service (SMTP)

**Frontend** (`apps/web/.env.local`):
- NextAuth secrets
- API base URL
- OAuth2 client IDs

**Note**: `.env.local` files are gitignored. Copy from `.env.example` templates.

## Turborepo Task Pipeline

**Key Tasks** (defined in `turbo.json`):
- `build`: Builds projects with dependency graph
- `dev`: Watch mode (persistent, no cache)
- `test`: Unit/integration tests
- `lint`: ESLint validation
- `typecheck`: TypeScript validation
- `clean`: Remove build artifacts

**Caching**: Turbo caches build/test outputs based on input files. Use `--force` to bypass cache.

## Common Patterns

### Adding a New API Endpoint

1. **Backend**:
   - Add DTO in `application/dtos/`
   - Define UseCase interface in `application/ports/in/`
   - Implement UseCase in `application/services/`
   - Add controller method in `infrastructure/adapter/in/`
   - Add Swagger decorators for OpenAPI

2. **Generate Client**:
   ```bash
   pnpm gen:api
   ```

3. **Frontend**:
   - Create React Query mutation/query in `features/<domain>/api/`
   - Use generated API client from `@repo/api-client`
   - Add Zod schema for validation

### Adding a New Feature

1. **Backend Module**:
   ```bash
   cd apps/api
   pnpm create:module <feature-name>
   ```
   - Implement hexagonal layers
   - Add database migrations if needed
   - Write tests

2. **Frontend Feature**:
   - Create `features/<feature-name>/` directory
   - Add `api/`, `hooks/`, `schemas/`, `components/`, `types/`
   - Follow FSD dependency rules

3. **Integration**:
   - Generate API client: `pnpm gen:api`
   - Create container in `containers/<feature-name>/`
   - Add route in `app/`

## Architecture Principles

### Backend
- **Hexagonal Architecture**: Strict layer separation (domain → application → infrastructure)
- **Domain-Driven Design**: Rich domain models with business logic
- **Dependency Inversion**: Depend on interfaces (ports), not implementations
- **Explicit Mapping**: Never expose domain entities to controllers

### Frontend
- **Feature-Sliced Design**: Features are isolated, composable domains
- **Server State**: React Query for all server state management
- **Client State**: Zustand for UI state (minimal)
- **Type Safety**: Zod schemas validate all external data
- **Accessibility**: shadcn/ui components are WCAG compliant

### Monorepo
- **Workspace Isolation**: Packages are independent, reusable
- **Shared Configuration**: Centralized ESLint, TypeScript, Prettier configs
- **Task Orchestration**: Turbo handles parallel builds and caching
- **Type Safety**: Shared types in `@repo/shared` and `@repo/api-client`

## Current Development Focus

**Active Branch**: `feat/onboarding`

**Status**:
- ✅ Authentication (local + OAuth2)
- ✅ Onboarding flow
- 🚧 Real-time mentoring sessions (~30% complete)
  - LiveKit integration in progress
  - WebSocket signaling implementation
  - Collaborative code editor (Y.js)

**Next Steps**:
- Complete real-time session features
- VOD recording pipeline
- Payment integration

## Troubleshooting

### Database Connection Issues
```bash
# Ensure infrastructure is running
pnpm infra:up

# Check migrations are applied
cd apps/api
pnpm migration:run
```

### API Client Out of Sync
```bash
# Regenerate after backend changes
pnpm gen:api
```

### Type Errors After Package Updates
```bash
# Clean and rebuild
pnpm clean
pnpm build
```

### Port Already in Use
```bash
# API (3001) or Web (3000) ports in use
lsof -ti:3001 | xargs kill -9  # Kill API
lsof -ti:3000 | xargs kill -9  # Kill Web
```

### pnpm Lock File Issues
```bash
# Regenerate lockfile
rm pnpm-lock.yaml
pnpm install
```
