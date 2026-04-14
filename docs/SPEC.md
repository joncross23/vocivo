# Vocivo

## Product vision

Vocivo is a Spanish vocabulary mastery platform for teenagers aged 15 to 18. It should feel closer to a stylish competitive study game than a school worksheet: fast to open, visually confident, rewarding to replay, and clear about what the learner is improving.

The product is greenfield. Earlier apps and experiments are useful reference points for tone, game feel, and proven interaction patterns, but this spec is centred on a new build around a single CSV vocabulary source.

Core proposition:

- 2,000+ Spanish to English vocabulary items from one canonical CSV source
- Organised by theme, topic, and word type
- Studied through flashcards, quizzes, spaced repetition, matching, and headline game modes
- Unified progression across every mode: XP, levels, streaks, daily goals, achievements, and mastery views

## Audience

Primary audience:

- GCSE-age learners and adjacent teen learners
- Users who want revision to feel sharp, modern, and competitive rather than childish
- Mobile-first users who still expect a polished desktop experience

The tone should be:

- Confident, dark, fast, and slightly edgy
- Motivating without sounding patronising
- British English throughout

## Product principles

1. Revision should feel playable.
2. The content model should stay cleaner than the UI surface.
3. Every activity should move one shared sense of progress forward.
4. Search and navigation should be fast enough to support "I want this word set now".
5. The app should reward consistency, not just volume.

## Scope

### In scope

- One learner profile stored locally first, with optional cloud sync later
- CSV-driven vocabulary ingestion and normalisation
- Theme browser, topic browser, word-type browsing, quick filters, bookmarks, and search
- Flashcards, quizzes, spaced repetition, matching, and multiple arcade-style vocab games
- Unified dashboard, level system, streaks, daily goals, achievements, and statistics
- Full mobile support plus richer desktop controls

### Out of scope for v1

- Grammar teaching beyond lightweight usage/context support
- Teacher dashboards, class management, or assignment workflows
- Social feeds, public deck creation, or marketplace features
- Live multiplayer
- AI-generated vocabulary content as a primary source

## Content and navigation

Vocivo is built around a single canonical vocabulary dataset sourced from `data/raw/knowt_flashcards_translations_full.csv`.

Current source shape:

- 2,042 rows
- 3 theme groups
- 9 topics
- 27 topic-by-word-type deck buckets
- Word types currently present in source: nouns, verbs, adjectives

Navigation should support both structured browsing and fast intent-based entry:

- Theme -> topic -> word type
- Quick filters: unseen, weak, due today, starred, recent mistakes, all nouns, all verbs, all adjectives
- Instant search across Spanish, English, alternates, and topic labels
- Smart entry points on the home screen: continue review, resume streak, play a game, revisit weak words

User-facing selection should be explicit and flexible:

- `Theme` is the top-level macro grouping
- `Category` is the learner-facing label for a topic within or across themes
- `Grammar type` is the learner-facing label for part of speech or equivalent study type
- Every non-game study mode should allow the learner to start from any one of these selectors, or from a combination of them
- Typical combinations should include `Theme 3 + Media and technology + nouns`, `Theme 1 + all verbs`, and `all categories + adjectives`
- The deck-builder surface should always show the live word count before the learner starts
- The selector model should be visible from the top of the product, not hidden behind an advanced filter drawer

Prebuilt deck surfaces should also stay first-class:

- Each source deck bucket should be viewable as its own study set
- A deck detail surface should show deck title, theme, category, grammar type, and term count
- The learner should be able to search within that deck, star it, and launch directly into Flashcards, Test, Match, or Review from the same screen
- This mirrors the useful part of Knowt's flashcard-set UX without copying its visual language
- Every theme card, category card, grammar-type card, and deck card should also show practice coverage so lightly practised areas stand out immediately

Stable IDs should be preserved for the taxonomy:

- Theme IDs remain stable and human-readable
- Topic IDs remain stable even if display labels evolve
- Each vocab entry keeps a durable content ID derived from source metadata
- Category IDs should map cleanly to topic IDs so the user-facing label can stay friendly while internal references stay stable

## Shared learner system

Vocivo should behave like one learning system, not a collection of disconnected modes.

Every vocab entry should share the same learner record across the app:

- `unseen` until the learner flips it, answers it, or encounters it in a scored game
- `seen` after the first completed interaction
- `learning` while the entry is still unstable
- `weak` if it is missed twice in its last five scored interactions, or rated `again` twice in its last five flashcard reviews
- `mastered` once it has been recalled successfully on three separate days without becoming weak again
- `due` whenever its next scheduled review time is in the past
- `bookmarked` whenever the learner explicitly stars it

Update rules should stay consistent:

- Flashcard ratings update the same learner record as quiz answers
- Quiz answers and game outcomes should only update mastery when the prompt-answer pair is unambiguous
- Speed and streak can affect XP, but they should not by themselves mark a word as mastered
- Bookmarks are preferences only; they do not change mastery or SRS timing

Practice should also aggregate upward into sets:

- Every scored interaction should increment practice counts for the entry itself, its theme, its category, its grammar type, and its source deck
- Set surfaces should expose at least attempts, words seen, and last practised date
- Light-practice states should be visually obvious so learners can spot neglected sets quickly
- Practice heat should guide navigation, but it should not override weak-word or due-review urgency

Suggested set-level states:

- `untouched` when no items in the set have been seen
- `light practice` when fewer than 20% of items have any scored interaction, or the set has not been practised in 14 days
- `active practice` when at least 20% of items have scored interactions and the set has been practised recently
- `well practised` when at least 60% of items have scored interactions and the set has been practised recently

XP should also be unified even if the activities feel different:

- Flashcards should be the lowest-XP but highest-volume mode
- Quizzes and typed recall should award more XP per correct result than passive review
- Games should award per-event XP plus an end-of-run quality bonus tied to accuracy
- Daily goals, streak bonuses, and achievements should add XP without changing per-word mastery state

## Study modes

### Flashcards

Flashcards should feel premium rather than bare-bones.

Directions to include:

- 3D flip motion for reveal
- Swipe on mobile and keyboard shortcuts on desktop
- Confidence rating after reveal
- Audio pronunciation where available, with browser TTS fallback where needed
- Shuffle, autoplay, reverse direction, and bookmark controls
- End-of-deck summary grouped by "easy", "iffy", and "again"
- Flexible deck sources: theme, category, grammar type, due review, weak words, bookmarks, recent mistakes, and custom mixed deck

Directions worth exploring beyond the obvious:

- "Keep until clean" mode for hard cards
- Confidence heat strip across the current deck
- Quick accent helper when the answer direction is Spanish
- Auto-repeat for cards answered too slowly even if technically correct
- Short context or usage note on the reverse where curated data exists

Confidence ratings should have shared-system meaning:

- `again` keeps the card in short-cycle review and contributes toward `weak`
- `iffy` counts as seen and reviewed, but should not advance the card toward mastered
- `easy` can advance the card if it is recalled accurately and not answered unusually slowly

### Tests and quizzes

Vocivo should support several quiz formats that all read from the same entry pool:

- Multiple choice with four options and same-topic distractors
- Written answer with fuzzy matching and accent helper bar
- True/false quick-fire rounds
- Fill-in-the-blank cards using curated sentence context when available

Reverse-direction study should be supported, but not every content row should be treated as equally safe for every direction:

- Spanish to English is the default direction across the product
- English to Spanish should be available in flashcards and quizzes
- English to Spanish typed recall should prefer entries with one clear canonical Spanish answer
- Nouns should preserve articles in display, but articleless Spanish should still be accepted as a softer match in typed practice
- Complex inflection-heavy entries should stay out of fast reverse-direction modes unless explicitly curated for them

Formatting can vary, but each quiz mode should produce clear feedback:

- what was correct
- what was accepted
- what should be reviewed next

### Spaced repetition

The app should surface a daily review queue on open.

Expected behaviour:

- Every card has an SRS state independent of the surface where it was learned
- Weak cards come back quickly
- Stable cards disappear for longer intervals
- Mature cards should usually stay out of the queue for at least 7 days unless performance drops
- Theme and topic views should expose mastery at a glance

Suggested review cadence:

- `weak` or `again` cards should usually reappear the same day or next day
- `learning` cards should cycle back within a few days
- `stable` cards can move into multi-day spacing
- `mastered` cards should mostly sit in long spacing until accuracy drops again

### Matching

Matching should be the short-session, high-rhythm study mode.

Expected behaviour:

- Face-up Spanish and English tiles
- Tap or drag to pair translations
- Scaling board sizes
- Speed combos and board-clear bonuses
- A finish screen that points the learner back toward weak pairs
- Deck selection before play should support theme, category, and grammar type filters rather than one rigid pack picker

## Headline games

These are the main game surfaces rather than decorative quiz wrappers.

### Car Racing

An arcade lane-switching translation game where choosing correctly keeps speed, momentum, and score alive.

Ideas to explore:

- Parallax scenery and stronger sense of forward motion
- Power-ups such as shield, slow motion, hint pulse, and 2x XP windows
- Boss rounds or checkpoint bursts after clean streaks
- Unlockable car skins tied to achievements or theme mastery
- Clear answer resolution that shows the full pair, not just "right/wrong"

### Traffic Jam

A drag-to-match pressure game where vocabulary pairs must be cleared before the board becomes unmanageable.

Ideas to explore:

- Tutorial overlay that disappears once understood
- Word-type colour coding and more expressive states for panic
- Combo chains for fast correct clears
- Clear-the-board bonus moments
- Anti-frustration spawn logic so losses feel earned rather than random

### Word Sprint

A minimalist typing race.

Core shape:

- Spanish prompt appears
- Player types the English answer and confirms
- Speed and streak build score multipliers
- The session escalates from clean, short prompts into trickier items
- The visual language should feel stripped-back and intense

### Word Ladder

A vertical challenge with visible ascent.

Core shape:

- Correct answers move the player upward
- Wrong answers cost lives
- Easier lower rungs mix speed and confidence
- Higher rungs introduce more typed answers and less margin for error
- Daily challenge ladders provide a repeatable benchmark

### Additional concept to explore: Rhythm Raid

A beat-synchronised translation game where timing matters as much as correctness.

Why it belongs:

- It feels more like a real game than a skin on a quiz
- It suits short sessions and repeat play
- It gives the product a distinct identity beyond flashcards plus racing

## Progression and gamification

All modes feed one shared progression layer.

### XP and levels

Use the inherited level curve:

- `level = floor(sqrt(totalXP / 100))`

The system should make level-ups legible and frequent early on, then slower and more meaningful later.

### Streaks

Daily activity streaks should feel important but not cruel.

Expected behaviours:

- Fire icon and count on the home dashboard
- Milestones at 7, 30, and 100 days
- Streak freezes earned through consistency
- Recovery prompt after a missed day

### Daily goals

Users can choose an XP target such as 25, 50, 100, or 200.

Expected behaviours:

- Circular progress ring on the dashboard
- Completion celebration
- Bonus for overshooting the target significantly
- Weekly view showing which days were hit or missed

### Achievements

Achievement families should include:

- vocabulary milestones
- game-specific performance
- streaks and consistency
- accuracy and speed records
- breadth milestones such as clearing every theme

### Statistics dashboard

Useful views include:

- words seen, learned, and mastered by period
- accuracy trend by mode
- strongest and weakest topics
- time spent and XP history
- review burden for upcoming days
- light-practice areas by theme, category, grammar type, and deck

## UX and aesthetic

The product should not look like a school portal or a generic startup dashboard.

The companion visual brief lives in `docs/VISUAL-SYSTEM.md` and should be read alongside this section.

Desired feel:

- Dark mode by default, with light mode available
- User-selectable accent colour
- Bold typography, roomy spacing, polished transitions
- Motion used for reward and pace, not clutter
- Full-screen game modes with very little chrome

Suggested visual lane:

- Night-drive energy rather than classroom energy
- Editorial type mixed with instrument-panel UI
- Route lines, ladders, rings, and streak flames used as recurring motifs
- Achievement badges that feel closer to streetwear patches or racing decals than school stickers
- Dashboard modules that feel like a personal command deck, not a spreadsheet

Surfaces should have distinct personalities:

- Dashboard: command deck and progress radar
- Flashcards: sleek, tactile, almost collectible
- Stats: signal-rich and analytic without becoming corporate
- Games: full-bleed, theatrical, and nearly chrome-free

Colour should do real work:

- Accent colour personalises the learner's space
- Warm danger colours should flag neglected or weak areas
- Cooler tones should signal stable mastery and calm review
- Light-practice sets should be legible from a distance, not only after opening a stats panel

Visual references to avoid:

- childish mascot energy
- pastel productivity UI
- overly corporate admin-panel styling

## Technical direction

Preferred stack:

- Next.js 14
- TypeScript in strict mode
- Tailwind CSS
- Zustand
- Vitest
- Vercel deployment

Architecture expectations:

- Pure logic game engines with no DOM assumptions
- Renderer/UI layer separated from engine state
- CSV -> normalised JSON content pipeline at build time
- One shared progress store across study and game modes
- Offline-first local persistence with optional Supabase sync later

Performance targets:

- under 3 seconds to first useful render on a normal connection
- 60fps in game views on mainstream phones and laptops
- under 100ms for search/filter updates on the full dataset

Accessibility expectations:

- keyboard navigation for all non-game flows
- readable contrast in dark and light themes
- captions/tooltips where audio is important
- reduced-motion fallback for learners who need it

## Success bar

Vocivo succeeds when:

- a learner can jump from dashboard to useful study in seconds
- the content feels deep and well organised, not like one flat list
- the games are replayable on their own terms
- progression encourages coming back tomorrow
- the app feels recognisable and ownable rather than interchangeable
