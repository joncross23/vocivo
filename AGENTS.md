# AGENTS.md

This file is the operational harness for all agents working in the Vocivo repo.

## Source of truth

Before changing anything, read:

1. `docs/SPEC.md`
2. `docs/CONTENT.md`
3. `docs/VISUAL-SYSTEM.md`
4. `docs/architecture/MODULES.md`
5. `docs/architecture/OWNERSHIP.md`
6. `CONTRIBUTING.md`

If any of those disagree, stop and report the conflict.

## Working model

- Work from short-lived branches off `main`
- Stay inside the assigned write scope
- Do not edit shared contracts unless the task explicitly owns them
- Do not change root workspace files unless the task explicitly owns them
- Do not "helpfully" refactor unrelated files
- Stop if blocked by an incomplete dependency or unstable contract

## Task template

Every task must define:

- task ID
- goal
- owner
- allowed files or directories
- forbidden files or directories
- contracts referenced
- validation commands
- stop conditions

If those are missing, ask for the task to be tightened before proceeding.

## Write-scope rules

- Only the contract owner edits `packages/contracts/**`
- Only the root owner edits root config files
- Generated artefacts in `data/generated/**` are never hand-edited
- UI agents do not reach into infrastructure internals
- Domain logic must stay pure and framework-free

## Validation

Run the narrowest relevant checks first, then broader ones if available.

Expected repo-level gates once the scaffold exists:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

If the scaffold is not present yet, run the checks that do exist and report what is missing.

## Mocking strategy

When dependencies are incomplete:

- code against repository interfaces and contracts
- use in-memory adapters or fixtures
- use deterministic factories from the shared test kit
- do not invent one-off shapes outside the contract package

## Mandatory output contract

Every agent must return:

1. Summary of work
2. Files changed
3. Commands executed
4. Test results
5. Assumptions made
6. Blockers

## Stop conditions

Stop and report instead of guessing when:

- a contract is missing or contradictory
- another task owns the required files
- a dependency shape is unclear
- the requested change would cross multiple ownership boundaries without approval
