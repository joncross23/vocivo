# Git Process

This is the sustainable Git workflow for Vocivo.

## Default development flow

1. Pull latest `main`
2. Create a short-lived branch
3. Make a scoped change inside one ownership boundary
4. Run relevant validation
5. Open a pull request
6. Merge via squash after review and validation

## Protected trunk model

- `main` is always the integration target
- `main` should stay releasable
- no direct pushes to `main`
- no long-lived feature branches

## Parallel work

Parallel work is encouraged only when:

- contracts are frozen for the wave
- ownership boundaries are disjoint
- root files are not shared

Parallel work should be batched by wave, not merged chaotically.

## Merge order

1. root and CI changes
2. contract changes
3. domain and content-pipeline changes
4. application and infrastructure changes
5. UI shell changes
6. test harness and integration changes

## Conflict policy

- If two branches touch the same contract file, stop and reconcile centrally
- If two branches touch the same root file, the scaffold owner resolves
- If a feature requires a contract change, split it into a contract-first update

## PR size guidance

Aim for PRs that are:

- single-purpose
- easy to review
- easy to revert

Avoid mixing:

- architectural changes
- product behaviour changes
- broad refactors
- formatting-only churn

## Release guidance

- release from `main`
- tag with semver once real shipped milestones begin
- avoid release branches until there is a deployment need
