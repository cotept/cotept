# AI Agent Guidelines

> This document provides a set of rules and guidelines for AI agents (like Gemini) interacting with the `cotept` project. The goal is to ensure that AI contributions are consistent, predictable, and aligned with the project's architecture and conventions.

## 1. Primary Objective

The primary objective of an AI agent is to **enhance development productivity** by performing tasks such as code generation, refactoring, analysis, and bug fixing, while strictly adhering to the established architecture and coding patterns.

## 2. Core Principles

1.  **Knowledge-Base First**: Before starting any task, the agent must first consult the files listed in `.gemini/settings.json`, primarily `ARCHITECTURE.md` and `docs/development/component-development-workflow.md`, to understand the project's rules.
2.  **Pattern Mimicry**: All new or modified code must mimic the style, structure, and patterns of the existing codebase. The agent should analyze surrounding files to ensure consistency.
3.  **No Unilateral Decisions**: The agent must not introduce new libraries or make significant architectural changes without first proposing the change and receiving user approval.
4.  **Verify, Then Trust**: Do not assume the state of the code. Use tools like `read_file` and `list_directory` to verify file contents and structure before making changes.

## 3. Task-Specific Workflows

### 3.1. When Creating a New Frontend Component:

-   Follow the **Feature-Sliced Design (FSD)** principles outlined in `component-development-workflow.md`.
-   Correctly place the component in the appropriate layer: `shared/ui`, `features/[domain]/components`, or `containers/[page]`.
-   Prioritize reusing existing components from `@repo/shared` before creating new ones.

### 3.2. When Adding a Feature that Involves API Calls:

1.  **Backend First (if needed)**: If a new API endpoint is required, modify the NestJS controllers/services in `apps/api`.
2.  **Update API Client**: Run `pnpm gen:api` to update the `@repo/api-client` package.
3.  **Frontend Hook**: Create a TanStack Query hook (`useQuery`, `useMutation`) in `apps/web/src/features/[domain]/api/` to encapsulate the API call.
4.  **Container Logic**: Use the newly created hook within a container component in `apps/web/src/containers/[page]/`.
5.  **Page Display**: Render the container in the appropriate page file under `apps/web/src/app/`.

### 3.3. When Fixing a Bug:

1.  **Understand**: Analyze the bug report and use tools to locate the relevant code sections.
2.  **Replicate**: If possible, suggest creating a test case that replicates the bug.
3.  **Fix**: Apply the fix while adhering to all architectural and style guidelines.
4.  **Verify**: Run tests (`pnpm test`) and linting (`pnpm lint`) to ensure the fix does not introduce regressions or style issues.

## 4. Prohibitions (What NOT to Do)

-   **NEVER** write manual `fetch` or `axios` calls directly in a component. Always use the TanStack Query hooks defined in the `features` layer.
-   **NEVER** commit directly to the `main` or `develop` branches. Always work on a feature branch.
-   **NEVER** introduce secrets or API keys directly into the code. Use environment variables as configured in the project.
