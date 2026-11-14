# Base-game rules summary

Research baseline: the 2010 English Mayfair edition. This compact orientation is not an executable rules specification.

## Roles and goal

**2–8 players.** One controls both guards through seven players; at eight, two share the guard team. Others are individual novices. Each novice receives a hidden wish and blessing. Retrieve the specified keys, collect the wish item, then return to your cell. Guards win at captures equal to total players, or after round 15 without a novice victory. Novices finishing together compare capture counts, sharing victory if still tied. [Published rules, pp. 2, 4, 7](https://www.mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf)

## Round and movement

Novices plan secretly together, reveal movement cards, and check noise. Guards move, reveal speed, remove old clues, then listen. Advance the round. Round one grants novices two movements with the same speed card before guards act. Keys open every locked door. Wish pickup ends movement. Each character has a one-use blessing. [Published rules, pp. 2–6](https://www.mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf)

| Novice speed | Dots | Noise modifier |
| --- | --- | --- |
| Still | 0 | −3 |
| Sneak | 1–2 | −2 |
| Walk | 3–4 | −1 |
| Run | Up to 5 | 0 |

Guards walk 3–4 or run 5–6; runners cannot hear. They follow assigned patrols until qualifying evidence permits diversion. Sight is forward-facing through 180°, limited to six dots; walls and doors obstruct it. Inspect intermediate dots and turns, not just endpoints. When a novice disappears, mark the exit direction. Capturing requires reaching her dot. [Rules transcription](https://www.ultraboardgames.com/nuns-on-the-run/game-rules.php)

## Hearing and recovery

After novice movement, eligible novices roll against guards who walked previously. After guard movement, each walking guard rolls. Apply the novice speed modifier; compare with shortest-path distance through doors. A heard novice places directional noise beside the guard. Equal shortest paths permit a choice of either or both directions.

Capture earns a point, preserves keys, and loses an acquired wish. The caught novice walks toward home while visible; once ending unseen, returns to her cell and resumes normal status next turn. [Rules transcription](https://www.ultraboardgames.com/nuns-on-the-run/game-rules.php)

## Before implementing the engine

Transcribe and review the full numbered graph, doors, patrol paths, card inventory, blessing timing, sight exceptions, caught-state protections, setup details, and end-phase ordering. Special sight tables and first-round edge cases require explicit fixtures. Do not infer rules from gallery art. Track unresolved interpretations with source/page references before locking a versioned edition manifest. Optional variants stay disabled until separately specified and tested.
