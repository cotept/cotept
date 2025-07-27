# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CotePT** is a 1-on-1 live mentoring session service built with a modern monorepo architecture. It provides real-time shared code editing and WebRTC voice communication for effective developer mentoring, with session recording capabilities for VOD.

## Architecture

This is a **Turborepo monorepo** with **pnpm** workspace using **Hexagonal/Clean Architecture** principles:

### Repository Structure
- `apps/api/` - NestJS backend API with hexagonal architecture
- `apps/web/` - Next.js frontend application
- `packages/shared/` - Shared UI components and utilities
- `packages/api-client/` - Auto-generated OpenAPI client
- `packages/typescript-config/` - Shared TypeScript configurations
- `packages/eslint-config/` - Shared ESLint configurations

### Backend Architecture (apps/api/)
The NestJS API follows **strict hexagonal architecture** with three layers:

#### Domain Layer (`domain/`)
- **Models**: Rich domain entities with business logic
- **Value Objects**: Immutable objects with validation (Email, PhoneNumber, etc.)
- **Domain events and aggregates**

#### Application Layer (`application/`)
- **DTOs**: Data transfer objects with validation
- **Ports**: Abstract interfaces (In: use cases, Out: repositories/services)
- **Services**: Business logic orchestration
  - **Use Cases**: Implementation of business rules
  - **Facade**: Service orchestration layer
- **Mappers**: Domain ↔ DTO transformation

#### Infrastructure Layer (`infrastructure/`)
- **Adapters**: Implementation of ports
  - **In Adapters**: Controllers, request/response DTOs
  - **Out Adapters**: Repository implementations, external services
- **Common**: Guards, strategies, decorators, validators

### Key Architectural Patterns
- **Port-Adapter Pattern**: Clear separation between business logic and external concerns
- **Repository Pattern**: Unified data access with base classes (`BaseRepository`, `BaseNoSQLRepository`)
- **Facade Pattern**: Service orchestration
- **Mapper Pattern**: Multi-layer data transformation
- **Factory Pattern**: Value object creation

## Development Commands

### Root Level Commands
```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm dev:api               # Start only API server
pnpm dev:web               # Start only web application

# Building
pnpm build                 # Build all applications
pnpm build:api             # Build only API
pnpm build:web             # Build only web

# Quality Assurance
pnpm lint                  # Lint all packages
pnpm test                  # Run all tests

# Infrastructure
pnpm infra:up              # Start Docker services (Oracle DB, Redis, NoSQL)
pnpm infra:down            # Stop Docker services
pnpm infra:up:arm64        # Start Docker services for ARM64 (M1/M2 Macs)

# API Client Generation
pnpm gen:api               # Export OpenAPI spec and generate client
```

### API Development (apps/api/)
```bash
# Development
pnpm dev                   # Start with watch mode and auto-migration
pnpm build                 # Build for production

# Database Management
pnpm migration:generate    # Generate new migration from entity changes  
pnpm migration:run         # Apply pending migrations
pnpm migration:revert      # Revert last migration
pnpm migration:create      # Create empty migration file

# Testing
pnpm test                  # Run unit tests
pnpm test:watch            # Run tests in watch mode
pnpm test:cov              # Run tests with coverage
pnpm test:e2e              # Run end-to-end tests
pnpm test:module [name]    # Run tests for specific module

# Module Creation
pnpm create:module [name]  # Generate new hexagonal architecture module
```

### Web Development (apps/web/)
```bash
pnpm dev                   # Start Next.js development server
pnpm build                 # Build for production
pnpm start                 # Start production server
pnpm lint                  # Lint with Next.js ESLint config
pnpm storybook             # Start Storybook development server
```

## Key Development Patterns

### Creating New Modules
Use the module generation script to maintain architectural consistency:
```bash
cd apps/api
pnpm create:module [module-name]
```

This generates the complete hexagonal architecture structure following the established patterns.

### Database Configuration
- **Primary Database**: Oracle Database (TypeORM)
- **NoSQL Database**: Oracle NoSQL Database
- **Cache**: Redis
- **Multi-environment**: Supports `.env`, `.env.local`, `.env.arm64` files

### Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Social login** support (Google, GitHub, Kakao, Naver)
- **Role-based access control**
- **Password hashing** with bcrypt

### API Client Generation
The project uses automated OpenAPI client generation:
1. API exports OpenAPI specification on startup
2. Client is auto-generated from the spec
3. Provides type-safe API calls for frontend

### Error Handling
- **Global error filter** with structured error responses
- **Validation pipe** with comprehensive DTO validation
- **Winston logging** with structured logs and daily rotation

### Testing Strategy
- **Unit tests** for domain models and use cases
- **Integration tests** for repositories and controllers
- **E2E tests** for complete user flows
- **Domain-driven testing** with mocked dependencies

## Code Quality & Linting

### TypeScript Configuration
- Strict type checking enabled
- Path mapping configured (`@/` → `src/`)
- Shared configurations via `@repo/typescript-config`

### ESLint Configuration  
- Shared configurations via `@repo/eslint-config`
- Automatic import sorting
- Unused import detection
- Architecture boundary enforcement
- Prettier integration

### Code Conventions
- **Naming**: Use clear, domain-driven names
- **Validation**: Multi-layer validation (Value Objects, DTOs, Entities)
- **Error handling**: Consistent error mapping from infrastructure to domain
- **Type safety**: Strong typing throughout with TypeScript

## Environment Setup

### Prerequisites
- Node.js >= 18
- pnpm 8.15.6
- Docker & Docker Compose

### Local Development Setup
1. Install dependencies: `pnpm install`
2. Start infrastructure: `pnpm infra:up` (or `pnpm infra:up:arm64` for M1/M2 Macs)
3. Set up environment files in `apps/api/` (`.env.local`)
4. Run migrations: `cd apps/api && pnpm migration:run`
5. Start development: `pnpm dev`

### Important Files
- `turbo.json` - Turborepo pipeline configuration
- `pnpm-workspace.yaml` - Workspace definitions
- `apps/api/.env.*` - Environment configurations
- `docker-compose.yml` - Infrastructure services
- `scripts/create-module.sh` - Module generation script

## Current Work in Progress: API Error Response Standardization

### Context
Working on improving API error handling and Swagger documentation to ensure all endpoints have comprehensive error responses documented.

### Completed Tasks
✅ **Domain Error Message Constants**: Created standardized error message files for all modules
- `AUTH_ERROR_MESSAGES` - Authentication related errors
- `USER_ERROR_MESSAGES` - User management errors  
- `MAIL_ERROR_MESSAGES` - Mail service errors
- `BAEKJOON_ERROR_MESSAGES` - Baekjoon module errors

✅ **Common Error Response Decorators**: Created reusable decorators in `/shared/infrastructure/decorators/common-error-responses.decorator.ts`
- `CommonErrorResponses()` - 500 errors
- `AuthErrorResponses()` - 401, 403 errors
- `ValidationErrorResponses()` - 400, 422 errors
- `CrudErrorResponses()` - Combined CRUD error patterns

✅ **Custom Exception Refactoring**: Replaced Auth module custom exceptions with standard NestJS exceptions + custom messages
- Login, Reset Password, Find ID, Logout UseCases completed
- Uses standard `UnauthorizedException`, `BadRequestException`, etc. with domain-specific messages

🔄 **Controller Error Documentation** (In Progress):
- Auth Controller: Partially completed (login, logout, refresh-token, validate-token, send-verification-code, verify-code)
- User Controller: Partially completed (userlist, getUserById) 
- Still need: User CRUD endpoints, Mail Controller, Baekjoon Controller

### Next Steps
1. Complete User Controller error responses (register, update, delete, change-password)
2. Add error responses to Mail Controller endpoints  
3. Add error responses to Baekjoon Controller endpoints
4. Update ErrorResponse DTO with better examples
5. Test and validate all error responses in Swagger

### Key Files Modified
- `/modules/*/domain/constants/*-error-messages.ts` - Error message constants
- `/shared/infrastructure/decorators/common-error-responses.decorator.ts` - Reusable error decorators
- `/modules/auth/application/services/usecases/*.usecase.impl.ts` - Refactored to use standard exceptions
- `/modules/auth/infrastructure/adapter/in/controllers/auth.controller.ts` - Added comprehensive error responses
- `/modules/user/infrastructure/adapter/in/controllers/user.controller.ts` - Partially updated

## Multi-Database Architecture
- **TypeORM**: For relational data with Oracle Database
- **NoSQL**: Oracle NoSQL Database for flexible schemas  
- **Consistent abstractions**: Base repositories handle both database types
- **Transaction support**: With isolation levels and retry mechanisms

## Performance & Monitoring
- **Caching**: Redis-based caching with TTL management
- **Logging**: Structured Winston logging with daily rotation
- **Monitoring**: Request/response interceptors for performance tracking
- **Health checks**: Built-in health check endpoints