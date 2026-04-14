# Vocivo

Vocivo is a Spanish vocabulary mastery platform built around a single CSV source of truth and a unified learner system spanning flashcards, tests, spaced repetition, and game modes.

This repository is currently in the planning and repo-bootstrap stage. Product direction lives in `docs/`; implementation will follow the backlog and architecture rules defined there.

## Core docs

- [Product spec](docs/SPEC.md)
- [Content architecture](docs/CONTENT.md)
- [Game design notes](docs/GAMES.md)
- [Visual system](docs/VISUAL-SYSTEM.md)
- [Mockups](docs/MOCKUPS.md)
- [Backlog](docs/BACKLOG.md)

## Build process

- Agent workflow and operating rules: [AGENTS.md](AGENTS.md)
- Contributor workflow and Git process: [CONTRIBUTING.md](CONTRIBUTING.md)
- Module boundaries: [docs/architecture/MODULES.md](docs/architecture/MODULES.md)
- Ownership map: [docs/architecture/OWNERSHIP.md](docs/architecture/OWNERSHIP.md)
- Integration and merge flow: [docs/architecture/GIT-PROCESS.md](docs/architecture/GIT-PROCESS.md)

## Current source data

- Canonical CSV: [knowt_flashcards_translations_full.csv](knowt_flashcards_translations_full.csv)

## Working expectations

- `main` stays protected and releasable
- all changes land via pull request
- contracts and architecture are centralised before parallel feature work
- agents stop when blocked rather than guessing across boundaries
