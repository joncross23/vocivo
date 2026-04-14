# Ownership Map

This map exists to reduce merge conflicts and hidden coupling.

## Central ownership

- Root config files: central integrator / scaffold owner
- `packages/contracts/**`: contract owner
- `docs/architecture/**`: architecture owner

## Planned package ownership by workstream

- `apps/web/**`: UI shell owner
- `packages/ui/**`: UI shell owner
- `packages/application/**`: application owner
- `packages/domain/**`: domain owner
- `packages/infrastructure/**`: application or infrastructure owner
- `packages/content-pipeline/**`: content owner
- `packages/testkit/**`: QA owner
- `.github/workflows/**`: CI owner

## Shared files that require coordination

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `packages/contracts/**`
- design tokens

## Rules

- If your task does not own a file, do not edit it
- If a needed change crosses ownership, stop and escalate
- Avoid opportunistic edits in shared files
- Keep diffs package-local whenever possible
