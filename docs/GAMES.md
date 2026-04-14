# Vocivo Game Design Notes

These notes describe the intended feel, loop, and replay value of each game. They are not step-by-step implementation instructions.

## Shared game principles

- Each game should be playable in short sessions without feeling shallow.
- Game logic should live in a pure state machine or pure engine layer.
- Rendering, audio, and input should be swappable shells around that logic.
- A run should end with meaningful next actions: retry, review misses, or jump back into the main learning loop.
- XP should reward both completion and quality, not random grinding.

## Car Racing

### Core loop

- A prompt word is active.
- Multiple answer targets approach.
- The player steers into the correct answer while preserving lives and momentum.
- Correct play increases speed, score, and streak pressure.
- Clean play leads into checkpoint or boss-like moments before the finish.

### State machine phases

- intro
- countdown
- active run
- impact resolution
- checkpoint or boss burst
- finish
- results

### Difficulty scaling

- Increase world speed and traffic complexity over time
- Reduce the comfort window for late lane changes
- Introduce power-up trade-offs rather than only raw speed
- Use boss rounds sparingly so they feel like spikes, not routine

### Scoring and XP

- Base XP for each correct hit
- Streak multiplier for consecutive correct answers
- Bonus for perfect sectors, clean runs, and boss clears
- Reduced rewards if the player relies heavily on hints or shields

### Replay value

- Different prompt mixes and lane patterns
- Unlockable cosmetic rewards
- Difficulty presets
- Daily challenge variant with one seeded route

### Why it feels like a game

- The learner is making movement decisions under pressure, not just tapping the right button
- Speed changes alter emotional intensity
- Power-ups and boss moments create rhythm
- The road itself becomes part of the challenge

### Presentation notes

- Long road horizon, bright lane markers, and aggressive motion blur
- Answer cars should feel like targets, not floating buttons
- Boss rounds should look like events, with heavier colour and larger-scale scenery shifts

### Reference worth carrying forward

- Pure engine plus renderer split
- Deterministic collision and scoring logic
- Audio and particle effects driven by callbacks rather than buried in game state

## Traffic Jam

### Core loop

- Pairs enter the road and occupy a constrained grid
- The player drags or taps matching translation pairs together
- Correct clears create space
- Missed opportunities raise pressure as the board fills
- Panic moments emerge from board density, not unfair randomness

### State machine phases

- intro overlay
- countdown or ready state
- live board
- match resolution
- panic state
- clear-board bonus
- game over
- results

### Difficulty scaling

- Faster incoming pressure
- Heavier board density
- Tighter spawn logic in later waves
- More awkward word lengths and visually crowded states
- Short, earned panic windows rather than constant chaos

### Scoring and XP

- XP per clean correct match
- Combo rewards for rapid consecutive clears
- Clear-board bonus
- Smaller survival bonus based on time lasted and pile control

### Replay value

- Strong one-more-go structure
- Different pair mixes each run
- Clear sense that better board management changes outcomes
- Easy entry for short play sessions

### Why it feels like a game

- Spatial management matters
- The board creates pressure and relief
- Combos create tempo
- Anti-frustration rules keep failure readable

### Presentation notes

- Dense road-grid framing with visible build-up at the bottom of the playfield
- Panic moments should tint and shake the scene rather than throw extra UI on top
- Successful clears should feel like releasing pressure from a clogged system

### Reference worth carrying forward

- Grid-based logic
- Separate drag/tap input shell
- HUD elements like pile meter and streak indicator

## Word Sprint

### Core loop

- A prompt appears
- The player types the translation immediately
- Fast correct answers preserve a streak multiplier
- Slow or wrong answers break flow and cool the run down
- The session ramps through cleaner to harsher prompts

### State machine phases

- warm-up
- active sprint
- streak-overheat
- cooldown after error
- result summary

### Difficulty scaling

- Start with short, high-confidence translations
- Introduce longer or multi-answer items later
- Increase cadence between prompts as the run continues
- Optionally shift from topic-locked to mixed-topic chaos

### Scoring and XP

- Score driven by speed, accuracy, and streak length
- XP tied to accuracy bands plus session completion
- Extra reward for new personal bests or perfect streak segments

### Replay value

- It is ideal for high-frequency, sub-five-minute sessions
- WPM, best streak, and accuracy all create different mastery goals
- Seeded daily runs give the learner a fair benchmark

### Why it feels like a game

- Timing is central
- Streak state changes the atmosphere
- Mistakes have immediate emotional cost
- The interface can feel closer to a rhythm speed challenge than a quiz

### Presentation notes

- Black-heavy backdrop with one hot accent colour
- Typography should be large, severe, and unforgiving
- Streak should alter the whole atmosphere, not just increment a counter

## Word Ladder

### Core loop

- The learner starts at the bottom of a climb
- Each correct answer pushes them upward
- Harder rungs ask more from the learner than lower ones
- Mistakes cost lives and threaten the run
- Milestones break the ascent into clear emotional beats

### State machine phases

- start
- climb
- challenge rung
- milestone celebration
- life loss
- summit or fall
- results

### Difficulty scaling

- Lower rungs favour multiple choice and cleaner prompts
- Mid rungs introduce mixed formats
- Upper rungs rely more on typed answers and narrower tolerance
- Daily challenge ladders use a fixed sequence

### Scoring and XP

- XP for each rung cleared
- Milestone bonuses every few rungs
- Summit bonus for clearing the whole ladder
- Separate badge tracks for no-miss clears and long climbs

### Replay value

- Obvious visible progress in every run
- Good fit for a daily seeded challenge
- Multiple aspirational goals: height, accuracy, speed, no-hit climb

### Why it feels like a game

- The learner feels advancement physically and visually
- Risk rises as height rises
- Milestones create suspense
- Losses are dramatic and memorable

### Presentation notes

- The climb should feel vertical and mythic rather than cute
- Milestone tiers should visibly change the world below the learner
- The final stretch should feel sparse, cold, and difficult

## Rhythm Raid

### Core loop

- Translation prompts arrive on a beat grid
- The learner hits or selects the correct answer in time
- Accuracy and timing both matter
- Clean sequences build a combo track and unlock visual/audio flourishes

### State machine phases

- countdown
- groove window
- combo state
- break state after miss
- results

### Difficulty scaling

- Faster BPM
- Denser prompt streams
- More near-synonym distractors
- Mixed-topic charts for advanced runs

### Scoring and XP

- Timing grade plus answer correctness
- XP tied to completion quality and combo peaks
- Bonus for full-combo segments

### Replay value

- Strong audio-visual identity
- Easy to build daily or weekly featured charts
- High ceiling for mastery without needing long sessions

### Why it feels like a game

- Rhythm is the mechanic, not decoration
- There is a visible skill curve
- High replayability comes from timing mastery as much as vocabulary recall

### Presentation notes

- Beat lanes and prompt pulses should feel musically locked-in
- Timing feedback should be immediate and visually sharp
- This mode should feel like a performance space, not a worksheet with music

## XP integration across games

Shared rules worth keeping consistent:

- No game should create a separate progression economy
- Accuracy should matter more than raw survival time
- Replay should be attractive, but repeated low-quality farming should not dominate progression
- End screens should always expose missed words for follow-up study
