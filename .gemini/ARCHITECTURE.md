# Project Architecture

> This document serves as the master blueprint for the `cotept` project. It outlines the overall architecture, technology stack, data flow, and core design principles. All developers, including AI agents, should treat this as the single source of truth for architectural decisions.

## 1. Overview

The project is a **pnpm/Turborepo monorepo** designed for efficient, scalable, and type-safe development. It consists of a NestJS backend and a Next.js frontend, linked by an automatically generated API client.

### 1.1. System Flow Diagram

```mermaid
graph TD
    subgraph "Browser"
        A[Next.js Web App]
    end
    subgraph "Development Workflow"
        B(api-client)
        F[openapi-spec.yaml]
    end
    subgraph "Backend Infrastructure"
        C[NestJS API Server]
        D[(Oracle DB)]
        E[(Oracle NoSQL DB)]
    end

    A -- "1. HTTP/S Request (via api-client)" --> C
    style B fill:#fff,stroke:#333,stroke-width:2px
    C -- "`pnpm gen:api` (export)" --> F
    F -- "`pnpm gen:api` (generate)" --> B
    B -- "Provides type-safe functions" --> A
    C -- "TypeORM" --> D
    C -- "oracle-nosqldb driver" --> E
```

### 1.2. Directory Structure

- **`apps/api`**: The NestJS backend application.
- **`apps/web`**: The Next.js frontend application.
- **`packages/api-client`**: A critical, auto-generated package providing a type-safe client for frontend-backend communication.
- **`packages/shared`**: Code shared between applications (e.g., UI components, types).
- **`packages/*-config`**: Shared configurations for ESLint and TypeScript.

## 2. Key Workflows

### 2.1. API Type Synchronization (`pnpm gen:api`)

This is the core process that guarantees type safety between the frontend and backend.

1.  **Export**: The `api` app uses `@nestjs/swagger` to generate an `openapi-spec.yaml` file from its controllers and DTOs.
2.  **Generate**: The `api-client` package reads this spec and uses OpenAPI Generator to create a full-fledged, type-safe TypeScript client.
3.  **Integrate**: The `web` app consumes this `api-client`, enabling it to call backend APIs with full type safety and autocompletion, as if they were local functions.

### 2.2. Authentication Flow

The login process is a clear example of how the system components work together:

1.  **User Action**: The user submits the login form in the `web` app.
2.  **Client-Side Call**: The UI triggers `signIn('credentials', ...)` from `next-auth/react`.
3.  **Next-Auth Provider**: The call is handled by the `CredentialsProvider` (`apps/web/src/shared/auth/providers/credentials.ts`).
4.  **API Request**: The `authorize` function uses the auto-generated `api-client` to call the login endpoint on the `api` server.
5.  **Backend Auth**: The NestJS backend's `passport-local` strategy validates the credentials.
6.  **Token Issuance**: The backend generates a JWT (`accessToken`, `refreshToken`) and returns it.
7.  **Session Creation**: Next-Auth receives the tokens, creates a session, and stores it in a secure, HTTP-only cookie.
8.  **Authenticated Requests**: For subsequent API calls, an Axios interceptor reads the token from the Next-Auth session and attaches it to the `Authorization` header.

## 3. Design Principles & Core Technologies

### 3.1. Backend (`apps/api`)

- **Framework**: NestJS
- **Database**: TypeORM (for OracleDB) and `oracle-nosqldb` driver (for NoSQL).
- **Authentication**: Passport.js (`passport-jwt`, `passport-local`, social providers).
- **API Documentation**: `@nestjs/swagger` for automatic OpenAPI spec generation.

### 3.2. Frontend (`apps/web`)

- **Framework**: Next.js (App Router)
- **Architecture**: Feature-Sliced Design (FSD), as detailed in `docs/development/component-development-workflow.md`.
- **State Management**:
    - **Server State**: TanStack Query
    - **Client State**: Zustand
    - **Form State**: React Hook Form + Zod
- **Authentication**: Next-Auth (v5)
- **API Communication**: Axios and the auto-generated `@repo/api-client`.
