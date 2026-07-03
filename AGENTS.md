# SRGDJ Development Agent Guide

## Project Context

SRGDJ is an internal legal document management system for a governmental institution.

The project is a pnpm monorepo:

- apps/api: Express + TypeScript REST API
- apps/web: React + Vite + TypeScript frontend
- packages/shared: shared Zod schemas, types and constants
- docs: executive and technical documentation

Main stack:

- pnpm workspaces
- React
- Vite
- TypeScript
- TanStack Query
- React Hook Form
- Zod
- shadcn/ui
- Tailwind CSS
- Express
- Drizzle ORM
- MySQL
- Vitest

## Primary Objective

When reviewing this repository, always verify correctness before proposing changes.

Your goal is to:

1. Understand the existing architecture.
2. Detect bugs, security issues, type issues and broken flows.
3. Run or suggest the correct tests/checks.
4. Respect the current project structure.
5. Avoid unnecessary rewrites.
6. Propose small, safe and incremental changes.

## Required Review Order

Always review in this order:

1. Project structure and package scripts.
2. Shared schemas and types.
3. Backend API routes, controllers, services, models and middleware.
4. Database schema, relations, migrations and seed data.
5. Frontend API clients, hooks, forms, pages and components.
6. Authentication, authorization and permission checks.
7. Tests, build and lint/typecheck results.
8. Documentation consistency.

## Skill Usage Map

Use these skills depending on the task:

### General Project Review

Use:

- project-analyzer
- code-reviewer
- senior-software-engineer

Focus on:

- incorrect architecture usage
- duplicated logic
- broken imports
- missing validation
- inconsistent naming
- unsafe assumptions
- incomplete flows

### Backend Review

Use:

- nodejs-backend-patterns
- nodejs-best-practices
- nodejs-express-server
- backend-architect
- code-reviewer

Focus on:

- Express route correctness
- controller responsibility
- service/model boundaries
- middleware order
- error handling
- authentication
- authorization
- request validation
- response consistency

### Database Review

Use:

- drizzle
- database-designer

Focus on:

- Drizzle schema correctness
- MySQL compatibility
- relations
- nullable fields
- foreign keys
- soft delete behavior
- timestamps
- indexes
- seed consistency
- migration safety

### Frontend Review

Use:

- react-best-practices
- frontend-design
- composition-patterns
- accessibility
- code-reviewer

Focus on:

- component structure
- hooks correctness
- TanStack Query usage
- API client usage
- loading states
- error states
- empty states
- accessibility
- unnecessary re-renders
- UI consistency

### Forms and Validation

Use:

- react-hook-form
- zod

Focus on:

- schema consistency
- frontend/backend validation alignment
- form default values
- controlled vs uncontrolled inputs
- submit behavior
- error messages
- optional/null fields

### Styling and UI

Use:

- shadcn
- tailwind-css-patterns
- tailwind-v4-shadcn
- frontend-design
- accessibility

Focus on:

- shadcn/ui usage
- design tokens
- responsive layout
- sidebar active states
- buttons
- tables
- forms
- dialogs/drawers
- color contrast

### Testing

Use:

- vitest
- code-reviewer

Focus on:

- unit tests
- integration tests
- API behavior tests
- validation tests
- permission tests
- form tests
- edge cases

### TypeScript

Use:

- typescript-advanced-types
- code-reviewer

Focus on:

- unsafe `any`
- incorrect inferred types
- DTO/schema mismatches
- shared package types
- API response types
- null/undefined handling

### Refactoring

Use:

- refactoring-engineer
- senior-software-engineer

Only refactor when:

- the current code is duplicated
- the logic is hard to test
- responsibilities are mixed
- the change reduces risk
- the behavior remains the same

Do not refactor only for style.

### Documentation

Use:

- documentation-engineer
- seo only for public-facing README/documentation

Focus on:

- README accuracy
- setup instructions
- scripts
- environment variables
- API docs
- technical documentation
- executive documentation

## Testing Checklist

Before saying something works, verify or request the result of:

```bash
pnpm install
pnpm build:shared
pnpm build
````

For API:

```bash
pnpm dev:api
pnpm db:push
pnpm db:seed
```

For Web:

```bash
pnpm dev:web
```

Recommended checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

If a script does not exist, do not invent it. First inspect `package.json`.

## Functional Areas to Validate

### Authentication

Check:

* login with valid credentials
* login with invalid credentials
* JWT handling
* `/auth/me`
* logout
* inactive user behavior
* protected route behavior
* frontend session clearing on 401

### Roles and Permissions

Check:

* admin permissions
* jefe/encargado permissions
* normal user permissions
* middleware permission checks
* UI hidden/disabled by permissions
* 403 responses

### Documents

Check:

* list documents
* pagination
* global search
* filters
* sorting
* document detail
* create document
* update document
* soft delete
* hard delete only when intentionally allowed
* document events/history

### Catalogs

Check:

* document types
* statuses
* physical locations
* CRUD behavior
* active/inactive behavior if implemented
* references from documents

### Database

Check:

* seed data works
* foreign keys are valid
* soft deleted records are excluded from normal queries
* required fields are enforced
* nullable fields are handled correctly

## Code Rules

Do:

* keep changes small
* preserve existing architecture
* use shared schemas when available
* use `apiClient` instead of axios
* use TanStack Query for server state
* use React Hook Form + Zod for forms
* use Drizzle ORM patterns already present
* return consistent API errors

Do not:

* replace the architecture
* introduce axios
* bypass shared validation
* duplicate backend/frontend schemas unnecessarily
* hardcode permissions in many places
* remove soft delete behavior unless explicitly requested
* add new libraries without justification

## Output Format for Reviews

When reviewing code, respond with:

1. Summary
2. What is correct
3. Problems found
4. Risk level
5. Suggested fix
6. Files to change
7. Commands to test
8. Expected result

## Output Format for Implementation Tasks

When proposing code, respond with:

1. File path
2. Full code or exact patch
3. Explanation
4. Test command
5. Expected result

## Important Project Decisions

* This is an internal governmental system.
* Security and traceability are important.
* Soft delete is preferred for documents.
* Reports and notifications are not part of V1.
* The project should remain simple and maintainable.
* The system is still in active development.
