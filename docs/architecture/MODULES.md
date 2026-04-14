# Module Boundaries

This document defines the target package boundaries before implementation begins.

## Planned repo structure

```text
apps/
  web/
packages/
  contracts/
  domain/
  application/
  content-pipeline/
  infrastructure/
  ui/
  testkit/
data/
  raw/
  curated/
  generated/
```

## Dependency rules

- `apps/web` may depend on `ui`, `application`, `contracts`, `infrastructure`
- `ui` may depend on `contracts`
- `application` may depend on `domain`, `contracts`
- `infrastructure` may depend on `contracts`, `domain`, `content-pipeline`
- `content-pipeline` may depend on `contracts`, `domain`
- `domain` may depend only on `contracts`
- `contracts` depends on nothing inside the repo
- `testkit` may depend on `contracts`, `domain`

## Boundary intent

- `contracts`: schemas, DTOs, repository interfaces, contract-first types
- `domain`: pure business rules and scoring logic
- `application`: use cases and orchestration
- `infrastructure`: adapters for storage, generated content, search, time
- `content-pipeline`: CSV ingestion, normalisation, classification, emission
- `ui`: design tokens, primitives, and reusable presentational patterns
- `apps/web`: route composition and feature assembly
- `testkit`: fixtures, factories, in-memory mocks, helpers

## Non-negotiables

- Domain logic stays framework-free
- Contracts stay centralised
- Generated output is not hand-edited
- UI does not import infrastructure internals directly unless explicitly approved
