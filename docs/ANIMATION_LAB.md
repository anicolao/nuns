# Animation lab

Run `npm run dev` and open [the lab](http://localhost:5207/lab/). The gallery links to it. Use the form factor selector for 390 × 844 portrait phone, 844 × 390 landscape phone, 820 × 1180 tablet, 1440 × 900 laptop, and 1920 × 1080 tabletop. The iframe establishes an actual browser viewport, including media queries and viewport units. Review zoom scales the iframe from outside; 100% is the legibility baseline.

## Production parity contract

The lab embeds `/play/`, which mounts `InteractionScene.svelte`. It imports the existing `Component.svelte`, `ArtCard.svelte`, `Abbey.svelte`, `Token.svelte` and `Dice.svelte` renderers. There are no duplicate pieces, screenshot stand-ins or lab versions of controls. The `present` action and `MotionPlayer` live in `src/lib/motion/` and run in the gallery and play surface as well as the lab. Future game integration must mount these same components and dispatch authoritative state into them; do not replace approved interactions with separately implemented copies.

The current state adapter is the existing deterministic presentation adapter, not a complete rules engine. Seeded scenarios allow review before networking and the turn engine exist. Their starting state is explicit and resettable. The gallery explicitly enables the shared board’s audit controls; the play route does not. The `review` parameter enables a same-origin, parent-checked playback transport; it does not change the rendering or action handler. Secret card fronts are inert and hidden from accessibility when turned over. The public table does not mount private scenario pieces.

## Scenarios

| Scenario | Actions to review |
| --- | --- |
| Control a novice | Private speed selection, adjacent route steps, Undo step, commit, public speed projection |
| Guard hears a noise | Seeded hearing roll, directional clue beside the guard, no hidden source piece |
| Guard spots a novice | Turn the Abbess east to reveal Celeste; turn west to lose sight |
| Catch a novice on the map | Move onto the novice’s space; automatic capture, score, Walk, key retention and medicine return |
| Use False Noise on the map | Shared blessing artwork, private target/cancel/confirm, ordinary public noise, delayed reveal |
| Movement | Direct card choice, selection seal, all four cards visible, Undo |
| Wish / blessing / patrol | Two-sided 3D turn, reverse turn, stable card size, inspect/return |
| Key and medicine | Rejection before key, collection feedback, each Undo |
| Caught | Lab-triggered resolved capture, read-only status, automatic Walk selection, medicine return and key retention; Reset to repeat |
| Abbess | Tap/drag to an adjacent map space, tap pawn to turn, on-map Undo; phone pan/zoom |
| Die | Tap the modeled die to generate a local noise result; quaternion interpolation |

Perform an action inside the play surface, then use Replay, Pause, timeline scrubbing or ¼×–2× speed. Playback retains the actual Web Animations objects. It does not dispatch the game action again. New actions cancel retained presentation transforms before measuring their next positions. Reset restores scenario state and clears motion/history. Reduced motion and the OS preference settle directly into the resulting state.

For a private scenario on the table, use the phone companion below the public viewport. Playback controls target that companion. For Control a novice and False Noise, the lab relays only the typed public projection from the private phone into the table display. Other legacy fixtures retain independent local state. There is no room networking yet. The public table always shows the complete board for private scenarios. The lab’s reviewer-position selector rotates the iframe from outside the play surface, simulating walking around the physical table without changing the game or resetting state. No seat/viewing-edge UI appears inside the game.

## Approval

Approve or mark Needs work only after manual review. Decisions and notes are saved locally per scenario, form factor, acting edge and reduced-motion mode. Export produces a JSON review record. No combinations are approved automatically. A physical 55-inch table review is still required for reach, touch and viewing distance; a laptop preview does not establish those properties.

Run `npm run check`, `npm run test:unit` and `npm run build` after changes. Transport tests cover cancellation, retained handle replay, scrubbing, rate and die-render notification. Native Chrome review checks the live Svelte surface and its browser input behavior.

## Current verification

Native Chrome review exercised portrait-phone selection and wish reversal, landscape-phone collection/rejection/Undo/reset, tablet modeled-die interpolation and timeline scrubbing at 320 ms, laptop Abbess movement from 26 to 19, and public tabletop patrol rotation/turning/inspection. Reduced motion settled directly to the reverse. The west-edge viewport was inspected at 50% after correcting its centering. This is implementation verification, not user approval of every scenario/edge combination. No approval decisions were prefilled. Svelte checks report zero errors/warnings, all 11 unit tests pass, and the static build passes; the existing lazy Three.js chunk size advisory remains.

## Direct-manipulation revision

The board fits the tabletop viewport with no scrollbars. A compact 24-unit pawn body fits within one dot; the contrasting gold pointer and on-map facing label show orientation. Only adjacent destinations receive active 44 px hit targets, and they move the Abbess directly. Pointer capture supports dragging the same pawn to a lit destination and returning invalid drops. Tapping her opens cardinal-facing handles anchored to her position. Motion measurements are recaptured after direct manipulation so accepted drops animate from the live piece rather than a copied ghost. Phone camera controls provide focus, whole-board fit, zoom and background panning. Larger tablet and laptop viewports start with the whole board visible; the table always stays fitted.

Production cards turn when tapped, the movement hand uses a two-by-two phone layout and a four-card landscape layout, and the die itself rolls on tap. Diagnostic face selection remains in the gallery. The actual game has no separate move buttons, board audit panel, fixture-setting buttons or assigned viewing-edge text.

Native Chrome verification of this revision covered tabletop tap-to-move (26 → 19), pawn-facing handles, on-map Undo, and dragging the same pawn from 19 → 20. The full board fit without game scrolling. Portrait and landscape phone movement hands showed all four cards, and the landscape wish used the same ArtCard’s readable side well without overflow. Camera tests check all 155 points in every device fit, phone focus, drop-coordinate round trips, anchored zoom and pan bounds. All 14 tests pass.

## Capture presentation correction

The status piece is read-only. Use **Simulate capture** in the lab shell to deliver a resolved capture through `applyCapture`, shared with the presentation adapter. Repeated capture events cannot release a novice. The player surface has no capture toggle or capture Undo; Reset scene in the lab restores the starting fixture. This reviews the consequence of a resolved capture, not a complete guard encounter or return-home journey.

The status panel uses a compact horizontal layout on short landscape screens instead of retaining its portrait minimum height. Headless Chromium verification covered all five viewport sizes with normal and reduced motion: panel containment, no page overflow, inert status taps, and automatic Walk/medicine return/key retention. Type checks, all 14 unit tests and the static build pass.

## Board encounter interaction slice

`EncounterBoard.svelte` mounts the existing `Abbey.svelte`, pawn, board camera and blessing card renderer. Its overlays, direct map targets and controls are the same components on `/play/` and in the lab iframe. `game/encounter.ts` supplies typed transitions and a separate public projection. The public phone-companion display holds only that projection: route, uncommitted target, secret item and unused blessing state are absent. The lab forwards projections from the active same-origin companion only; this is a local presentation bridge, not a multiplayer resolver or adversarial secrecy guarantee.

Scenarios seed known positions and a hearing die result of 6, with the walking novice’s −1 modifier. Hearing uses the existing shortest-path sound queries; sight uses the existing facing and visibility tables. Capture follows a guard move onto the novice’s dot, once per encounter, rather than a player choosing a captured state. The capture fixture stops after the consequence display; a full return-home turn sequence remains outside this slice. Novice routing supports adjacent steps, speed allowances, locked-door checks, private edits and irreversible commit. Full round phases, patrol restrictions, both guards, intermediate-step disclosure resolution, objectives and multiplayer authorization remain future engine work.

The [published rules, page 7](https://www.mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf) specify that False Noise is placed during hearing and revealed in the corresponding phase of the next turn. Placement uses explicit direction targets beside the seeded guard; the card’s full targeting restrictions are not yet transcribed or claimed as implemented. The lab labels this boundary. Target/cancel/confirm stays on the private phone. The public display receives the same ordinary noise clue as genuine hearing, and learns the card identity only when the reviewer advances to the next hearing phase.

Run `npm run build`, `npx playwright install chromium`, then `npm run test:browser`. Browser tests exercise all five new scenarios at all five viewport sizes with normal and reduced motion, replay/scrubbing, and the private-phone/public-table projection at all four tabletop acting edges. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for a system Chromium, or `PLAYWRIGHT_BASE_URL` (including a trailing slash) to verify a deployed preview. CI runs these browser checks against its prefixed production build before deployment. Physical table hardware approval is still separate.
