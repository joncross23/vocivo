# Vocivo Content Architecture

## Source of truth

Primary source file:

- `/Users/jonx/Projects/vocivo/knowt_flashcards_translations_full.csv`

Current observed source characteristics:

- 2,042 rows in total
- 4 blank rows that should be discarded during ingestion
- 3 theme groups
- 9 topics
- 27 deck buckets formed by topic plus word type
- Word types currently present: adjectives, nouns, verbs

This is a greenfield content system. The CSV is the source of truth; generated JSON is a build artefact.

## Taxonomy

### Theme groups

The source already implies three stable themes:

- `theme-1` -> Theme 1: People and lifestyle
- `theme-2` -> Theme 2: Popular culture
- `theme-3` -> Theme 3: Communication and the world around us

### Topics

Each topic belongs to one theme:

- `identity-and-relationships`
- `healthy-living-and-lifestyle`
- `education-and-work`
- `free-time-activities`
- `customs-festivals-and-celebrations`
- `celebrity-culture`
- `travel-and-tourism`
- `media-and-technology`
- `environment-and-where-people-live`

Observed topic sizes:

| Theme ID | Topic ID | Row count |
|---------|----------|-----------|
| `theme-1` | `identity-and-relationships` | 231 |
| `theme-1` | `healthy-living-and-lifestyle` | 182 |
| `theme-1` | `education-and-work` | 336 |
| `theme-2` | `free-time-activities` | 269 |
| `theme-2` | `customs-festivals-and-celebrations` | 148 |
| `theme-2` | `celebrity-culture` | 175 |
| `theme-3` | `travel-and-tourism` | 200 |
| `theme-3` | `media-and-technology` | 128 |
| `theme-3` | `environment-and-where-people-live` | 373 |

In the product UI, these topic-level groupings should normally be labelled as `categories`, because that is the more natural learner-facing term.

### Word types

Current source-backed word types:

- `adjectives`
- `nouns`
- `verbs`

The schema should stay future-ready for phrases, expressions, and adverbs, but v1 content should reflect the source honestly rather than invent categories that are not there yet.

In the product UI, these should normally be presented as `grammar types` or `word types`, depending on available space.

## User-facing study selectors

The app should expose three first-class study selectors:

- `Theme`
- `Category`
- `Grammar type`

Selection rules:

- A learner can start practice from any one selector on its own
- A learner can combine selectors before starting a session
- The selection UI should always show the resulting word count
- Saved and generated collections such as `weak words` or `due today` should still be refinable by theme, category, and grammar type
- The 27 source deck buckets should remain available as first-class prebuilt study sets because they already exist as natural topic-plus-grammar-type units in the source
- Every selector surface should also expose practice coverage so lightly practised sets can be found quickly

User-facing set cards should therefore always be able to show:

- title
- parent theme and category where relevant
- grammar type where relevant
- total word count
- seen count
- last practised timestamp
- practice state such as `untouched`, `light practice`, `active practice`, or `well practised`

## Operational CSV fields

The source file contains a large amount of provenance metadata. The app mainly depends on a smaller operational subset.

### Core fields to ingest

| Field | Purpose |
|------|---------|
| `source_theme_group` | Stable theme grouping |
| `source_topic` | Topic label |
| `source_word_type` | Word type label |
| `card_term_text` | Spanish display text |
| `card_definition_text` | English display text |
| `source_url_deck_id` | Stable deck/source bucket ID |
| `card_flashcardId` | Stable item-level source ID |
| `source_label` | Human-readable provenance label |
| `source_url` | Source audit URL |
| `card_termAudio` | Optional Spanish audio |
| `card_definitionAudio` | Optional English audio |

### Provenance fields worth preserving in raw exports

- retrieval timestamps
- deck title
- deck size
- source index
- flashcard set IDs
- original HTML fields where useful for audit

## Example normalised rows

Raw examples from the current CSV:

| Theme | Topic | Type | Spanish | English |
|------|-------|------|---------|---------|
| Theme 1 | Identity and relationships | Adjectives | `alegre` | `cheerful` |
| Theme 1 | Identity and relationships | Adjectives | `bonito` | `pretty, nice` |
| Theme 3 | Media and technology | Nouns | `la pantalla` | `screen` |

## Build pipeline behaviour

The build script should transform the CSV into a clean JSON content graph.

### Ingestion

- Read the CSV as UTF-8
- Ignore rows where either side of the card is blank
- Trim whitespace and preserve diacritics in the canonical display fields
- Strip any HTML wrappers from fallback rich-text fields if those are ever used

### Normalisation

For each row, produce one canonical vocab entry with:

- stable `id`
- `themeId`, `topicId`, and `wordTypeId`
- Spanish display text
- English primary answer
- English alternates
- raw source values for audit
- optional audio URLs

Each entry should also carry user-facing selection metadata:

- `themeId`
- `categoryId`
- `grammarTypeId`
- `sourceDeckId`

The product should treat `categoryId` as the learner-facing alias of the source topic ID.

Set-level aggregates should also be maintained for:

- `themeId`
- `categoryId`
- `grammarTypeId`
- `sourceDeckId`

Each aggregate should support at least:

- total items in set
- items seen in set
- scored interactions in set
- correct interactions in set
- last practised timestamp
- light-practice flag derived from low recent activity relative to set size

Suggested aggregate rules:

- `untouched` if `itemsSeen = 0`
- `light practice` if `itemsSeen < 20% of totalItems` or no scored interaction has happened in 14 days
- `active practice` if `itemsSeen >= 20% of totalItems` and the set has recent scored activity
- `well practised` if `itemsSeen >= 60% of totalItems` and the set has recent scored activity

### Answer complexity classes

Every normalised entry should be classified for study safety:

- `clean` for one clear canonical translation pair
- `multi-gloss` for entries with several acceptable English glosses
- `complex-form` for entries with inflection-heavy, pipe-heavy, or otherwise ambiguous answer strings

This class should drive mode eligibility more than raw word count alone.

### Answer parsing

The source contains a lot of multi-answer material:

- comma-separated meanings
- bracketed or parenthetical variants
- pipe-delimited inflection notes in some entries

Normalisation should therefore keep both:

- a clean `englishPrimary` used for display
- an `englishAlternates[]` list used for grading and flexible study modes

The app should not destroy the original answer string. Keep a `rawDefinition` for audit and future refinement.

Hardening rules for parsing:

- The raw source string should always be preserved unchanged
- Comma-separated top-level glosses should usually become accepted alternates
- Parenthetical material should remain visible in raw data, but accepted variants may include both with-parenthesis and without-parenthesis forms when both read naturally
- Pipe-heavy inflection or conjugation strings should not be flattened into one misleading display answer
- If an entry cannot be reduced into a clear primary answer without losing meaning, it should be marked `complex-form`

Mode-eligibility flags should be derived during normalisation:

- `reverseSafe`
- `typingSafe`
- `matchingSafe`
- `arcadeSafe`

This keeps downstream session builders fast and consistent.

### Reverse-direction grading

Reverse-direction grading needs separate rules because the source is strongest in Spanish-to-English form.

For English-to-Spanish practice:

- The canonical Spanish display form should preserve source spelling and articles
- For nouns, both article-present and articleless forms should be acceptable in typed recall
- The exact source form should still count as the strongest match for mastery and end-of-session feedback
- Accent-insensitive matching is acceptable for grading, but the correction UI should always show the accented canonical form
- `complex-form` entries should be excluded from fast reverse typing by default

### Difficulty

The CSV does not currently include an explicit 1 to 10 difficulty field.

Vocivo should therefore derive a working difficulty score at build time using a combination of:

- answer length and complexity
- word type
- number of accepted alternates
- punctuation or parenthetical complexity
- optional manual override file for known outliers

This keeps the product aligned with the design brief without pretending the source already contains a reliable difficulty column.

## Suggested JSON outputs

One reasonable output split:

```text
/public/content/index.json
/public/content/themes/theme-1.json
/public/content/themes/theme-2.json
/public/content/themes/theme-3.json
/public/content/topics/<topic-id>.json
/public/content/decks/<theme-id>/<topic-id>/<word-type-id>.json
/public/content/search-index.json
```

### Example deck payload

```json
{
  "id": "theme-1.identity-and-relationships.adjectives",
  "themeId": "theme-1",
  "topicId": "identity-and-relationships",
  "wordTypeId": "adjectives",
  "sourceDeckId": "6f55bbaf-a295-4ff1-a5eb-57db35baf543",
  "count": 88,
  "entries": [
    {
      "id": "6f55bbaf-a295-4ff1-a5eb-57db35baf543:ea0d26bd-5222-400b-abda-d6c262f9df36",
      "spanish": "alegre",
      "englishPrimary": "cheerful",
      "englishAlternates": [],
      "rawDefinition": "cheerful",
      "difficulty": 2,
      "themeId": "theme-1",
      "topicId": "identity-and-relationships",
      "wordTypeId": "adjectives",
      "audio": {
        "spanish": "https://...",
        "english": "https://..."
      }
    }
  ]
}
```

## Search and filtering

Search should be accent-insensitive and fast enough to feel instant on the full dataset.

Expected mechanics:

- match Spanish terms, English answers, alternates, topics, and theme labels
- support partial term matches
- normalise accents for search without changing display text
- allow filter stacking across theme, topic, word type, SRS state, bookmark state, and performance state

Useful saved filters:

- due today
- weak words
- unseen
- starred
- recent mistakes
- short answers
- by word type

The search and filter surface should also support the main learner intent from day one:

- practise by theme
- practise by category
- practise by grammar type
- refine any generated collection by those same selectors

## How entries feed modes

### Flashcards

- Can pull from any deck, topic, theme, saved filter, or custom mix
- Should tolerate rich alternates and longer answers
- Should allow direct selection by theme, category, and grammar type before the session starts

### Multiple-choice quiz

- Best with same-topic distractors and roughly similar answer shapes
- Should support theme, category, and grammar type selection before generation

### Written answer

- Uses primary answer plus alternates for grading
- Accent handling matters more when the answer direction is Spanish
- Should default to `clean` and `multi-gloss` entries rather than `complex-form` entries

### Matching

- Best with shorter entries and cleaner one-to-one mappings
- Can prioritise shorter nouns and adjectives for faster boards
- Should favour `clean` entries only

### Word Sprint

- Best with short-to-medium answers and clean scoring logic
- Should avoid overly ambiguous multi-answer rows unless a curated alternate list exists
- Should favour `clean` entries and optionally a hand-approved subset of `multi-gloss` entries

### Word Ladder

- Can mix short and long items by rung difficulty
- Should avoid `complex-form` entries unless explicitly curated for a challenge rung

### Car Racing and Traffic Jam

- Benefit from curated subsets rather than unrestricted full-dataset use
- Shorter entries and visually readable answers should dominate moment-to-moment play
- Should be fed from `arcade-safe` playlists derived from theme, category, and grammar type filters

## Spaced repetition integration

SRS should operate at the entry level, not at the deck-file level.

Each content item should be eligible for:

- seen / unseen state
- confidence history
- due date or due bucket
- accuracy and speed history
- bookmark state
- weak-word flag

This allows the same word to behave consistently whether encountered in flashcards, quizzes, or games.

Hard rules for state transitions:

- First completed interaction marks an item as `seen`
- Two misses within the latest five scored interactions mark it `weak`
- Three successful recalls on three separate days can mark it `mastered`
- Any item marked `weak` should re-enter the short-term review cycle
- Non-scored browsing should never change mastery

## Content quality notes

Observed source quirks worth planning for:

- 4 blank rows to discard
- many English definitions with commas
- some definitions with parentheses or inflection notes
- repeated Spanish or English strings across themes
- optional audio URLs are present only on part of the dataset

The system should favour traceability over aggressive cleaning. It should always be possible to tell how a normalised entry came from the source row.
