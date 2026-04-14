# Contributing

This repo is optimised for safe parallel delivery. The process favours stable contracts, isolated write scopes, and small reviewable pull requests.

## Branching model

- `main` is the protected trunk
- all work starts from `main`
- all work lands via pull request
- no direct commits to `main`

### Branch naming

Use one of these prefixes:

- `feat/<scope>-<slug>`
- `fix/<scope>-<slug>`
- `docs/<scope>-<slug>`
- `chore/<scope>-<slug>`
- `refactor/<scope>-<slug>`
- `test/<scope>-<slug>`
- `codex/<scope>-<slug>`

Examples:

- `feat/content-pipeline-normalizer`
- `docs/architecture-ownership-map`
- `codex/ui-dashboard-shell`

## Commits

Use Conventional Commits:

- `feat:`
- `fix:`
- `docs:`
- `chore:`
- `refactor:`
- `test:`

Keep commits scoped and readable. Avoid giant "misc cleanup" commits.

## Pull requests

Each PR should:

- solve one coherent problem
- stay inside the assigned ownership boundary
- avoid unrelated cleanups
- include validation results
- call out assumptions and blockers

### Required PR contents

- summary of change
- files or areas touched
- contracts referenced or changed
- commands run
- test results
- assumptions
- blockers or follow-up work

Use the PR template in `.github/pull_request_template.md`.

## Merge strategy

- default merge mode: squash merge
- rebase or update from `main` before merge if the branch has drifted
- contract changes merge before dependent implementation changes
- root config changes merge through the central integration flow

## Integration order

When multiple branches are active, merge in this order:

1. root scaffold and CI
2. contracts
3. domain and content-pipeline work
4. application and infrastructure work
5. UI shell and composition
6. test harness and integration coverage

## Validation policy

Before merge, run the strongest available checks.

Repo target gates:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

If those do not exist yet, report the missing gates explicitly in the PR.

## Ownership rules

- contracts are centralised
- root config is centralised
- generated data is not hand-edited
- agents should not edit the same files in parallel

See:

- `docs/architecture/MODULES.md`
- `docs/architecture/OWNERSHIP.md`
- `docs/architecture/GIT-PROCESS.md`

## Releases

- release from `main`
- tag using semver once implementation starts, for example `v0.1.0`
- avoid long-lived release branches until there is a real deployment cadence
