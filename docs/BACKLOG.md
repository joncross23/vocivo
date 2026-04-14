# Vocivo Backlog

This backlog sequences the product into buildable workstreams. It is intentionally ordered, but still framed as product scope rather than task-by-task implementation instructions.

## Build principles

- Build the content and learner system first, because every surface depends on them.
- Ship one coherent study loop before chasing every game.
- Use the selector model everywhere from the start: theme, category, grammar type.
- Preserve set-level practice coverage in every phase so neglected areas never become an afterthought.

## Phase 0: Product skeleton

Outcome:

- a branded shell with the right information architecture and visual system foundation

Scope:

- app shell, navigation, dark-first theme, accent system
- top-level routes for dashboard, browse, deck detail, study, games, stats, achievements
- reusable surface hierarchy based on the visual-system doc

Why first:

- every later feature inherits these decisions

## Phase 1: Content pipeline

Outcome:

- the CSV becomes a reliable, queryable content graph

Scope:

- CSV ingestion
- blank-row removal
- taxonomy generation for themes, categories, and grammar types
- stable entry IDs and source deck IDs
- alternate parsing and raw-definition preservation
- answer complexity classes
- mode-eligibility flags such as `reverseSafe`, `typingSafe`, `matchingSafe`, `arcadeSafe`
- searchable content index

Done looks like:

- a learner can browse sets by theme, category, grammar type, and source deck
- each set has a correct word count

## Phase 2: Shared learner system

Outcome:

- one unified progress model across all study surfaces

Scope:

- per-entry states: unseen, seen, learning, weak, mastered, due, bookmarked
- set-level aggregates for theme, category, grammar type, and deck
- practice-state labels: untouched, light practice, active practice, well practised
- XP, level, streak, daily goals, and achievement plumbing
- local persistence

Done looks like:

- practising one word in any mode updates the same learner record
- lightly practised sets are visible from browsing surfaces

## Phase 3: Dashboard and browsing

Outcome:

- the learner can immediately see what to do next

Scope:

- command-deck home dashboard
- browse screen with selector combinations
- deck-detail surface
- neglected-set callouts
- live resulting word counts before starting a session

Done looks like:

- a learner can go from home screen to a filtered study set in a few taps

## Phase 4: Core study loop

Outcome:

- one excellent non-game learning loop is live

Scope:

- flashcards
- spaced review queue
- confidence rating logic
- end-of-deck summary
- bookmarks and weak-word resurfacing

Done looks like:

- the learner can select a set, study it, rate cards, and see the shared system react correctly

## Phase 5: Practice test modes

Outcome:

- the product has stronger recall surfaces beyond cards

Scope:

- multiple choice
- written recall
- reverse-direction quiz support
- accent-aware grading and accepted-answer feedback
- recent mistakes and weak-word follow-up paths

Done looks like:

- the learner can run tests against any selector combination and get trustworthy grading

## Phase 6: Matching and Word Sprint

Outcome:

- the first high-replay game surfaces are live

Scope:

- matching mode using `matchingSafe` entries
- Word Sprint using `typingSafe` entries
- shared XP integration
- game-end review of misses

Why here:

- these modes are cheaper to validate than the larger arcade games
- they test the shared system under faster loops

## Phase 7: Car Racing and Traffic Jam

Outcome:

- the product gains its first theatrical headline games

Scope:

- Car Racing from `arcadeSafe` playlists
- Traffic Jam from curated fast-clear sets
- game HUDs, overlays, and end screens
- event-based XP and accuracy-weighted run bonuses

Done looks like:

- both games feel like real games, not just animated quizzes

## Phase 8: Word Ladder and Rhythm Raid

Outcome:

- the product’s game layer becomes distinct and ownable

Scope:

- Word Ladder progression mode
- Rhythm Raid performance mode
- daily seeded challenge variants where appropriate
- badge hooks for advanced play

Why later:

- they benefit from mature content safety rules and shared progression data

## Phase 9: Stats and achievements

Outcome:

- learners can understand both growth and neglect

Scope:

- detailed progress dashboard
- light-practice, weak-area, and mastery visualisations
- achievement wall
- best streak, best run, and personal benchmark surfaces

Done looks like:

- the learner can see what is improving, what is slipping, and what to do next

## Phase 10: Sync and polish

Outcome:

- the product feels durable rather than prototype-like

Scope:

- optional sync
- more refined motion and audio
- accessibility polish
- performance tuning
- onboarding and empty-state refinement

## Recommended vertical slices

If the build should stay momentum-friendly, these are the best slices:

### Slice A

- content pipeline
- shared learner system
- dashboard
- browse
- deck detail

### Slice B

- flashcards
- spaced review
- weak-word and due-today flows

### Slice C

- practice test
- written recall
- reverse-direction support

### Slice D

- matching
- Word Sprint

### Slice E

- Car Racing
- Traffic Jam

### Slice F

- Word Ladder
- Rhythm Raid
- stats
- achievements

## Highest-risk areas

- alternate parsing and answer normalisation
- reverse-direction grading quality
- keeping games readable with real vocab rather than hand-picked demo words
- avoiding drift between per-entry progress and set-level coverage
- preserving a distinctive visual style once real UI is built

## Best next build start

If starting implementation tomorrow, the strongest opening move would be:

1. Phase 1 content pipeline
2. Phase 2 shared learner system
3. Phase 3 dashboard and browsing
4. Phase 4 flashcards

That sequence gets the product’s core intelligence and navigation right before the more theatrical layers land on top.
