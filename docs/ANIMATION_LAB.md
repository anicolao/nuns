# Animation lab

Run `npm run dev` and open `/lab/`. The root route is the actual game entrance. The lab embeds `/play/?scenario=…` in real 390×844 phone, 844×390 landscape phone, 820×1180 tablet, 1440×900 laptop and 1920×1080 tabletop viewports. Zoom and tabletop acting-edge rotation apply outside the iframe; 100% is the legibility baseline.

## Production parity

The board walkthroughs and live Firebase rooms mount **the same `GameSurface.svelte`**. It uses the shared `MovementHand`, `Abbey`, `ArtCard`, `AbbessPawn`, dice, direct map controls and animation presenter. The novice’s first step displays the same four illustrated cards as Choose movement. No second speed-selector implementation remains.

`lab/fixtures.ts` supplies explicit starting positions and a seeded die result of 6. The novice walkthrough uses Letter from Lover to review objective-specific illustration and popup layout. Every action after that seed goes through `applyEvent`/`applyIntent` from the production engine. There is no independent encounter reducer. The lab’s transport changes playback only; Replay never submits another game action. The lab-only next-hearing control advances through legal fixture inputs outside the player surface.

| Walkthrough | Actions |
| --- | --- |
| Control a novice | Choose an illustrated movement card, Plan route, tap adjacent spaces, Undo step, commit |
| Guard hears a noise | Listen with Abbess, inspect the actual die, optionally use a blessing, Resolve hearing |
| Guard spots a novice | Move Abbess 18→19; the mandatory east-facing turn reveals Celeste at 20 |
| Catch a novice on the map | Move onto Celeste at 19; automatic score, caught status, item loss and key retention; continue the guard’s remaining steps |
| Use False Noise on the map | Open the private card, Use blessing, select a direction beside either guard, Cancel or Place noise, then advance to next hearing |

The other scenarios are isolated component benches: movement hand, wish/card reversal, blessing face, patrol card, token collection, status consequence, Abbess manipulation and die transport. They review individual renderers; the full board walkthroughs and network-room browser journeys review game flows.

## Privacy and animation

For private tabletop scenarios, use the companion phone below the public display. The lab relays only `publicGame` from that same-origin phone. It contains no setup seed, private wish, key/item status, private route or unplayed blessing identity. The public display owns only that projection. A False Noise clue has the same public representation as ordinary noise; its card identity appears in the next hearing phase. Legacy component benches retain independent local state.

Replay, Pause, timeline seek and playback speed act on retained production animations. Actions cancel previous presentation transforms before measuring the new state. Reduced motion settles immediately into the resulting state. On short screens, focus zoom accounts for viewport height so adjacent targets remain reachable. Guard map controls wait for server confirmation in network rooms. Vite ignores generated test/build output so browser trace recording cannot reload the game during play.

## Acceptance evidence

`npm run test:browser` covers every board walkthrough in all five viewports and both motion modes, transport seek/replay, and public/private projections at all four tabletop acting edges. An explicit parity test compares the movement hand used by the card bench and the novice walkthrough. `npm run test:backend` drives the actual Firebase-backed entrance, rooms and game controls using separate anonymous browser contexts, complete wins on both sides, rematch and eight-player concurrency. Traces and failure screenshots go to ignored `test-results/` subdirectories.

Review decisions are stored locally per scenario, viewport, tabletop edge and motion preference. Nothing is automatically approved. A real 55-inch hardware review remains necessary for touch reach, viewing distance and multi-touch behavior. The event model, card sources and edition interpretations are documented in [EVENT_MODEL.md](EVENT_MODEL.md).
