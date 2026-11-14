# Animation lab

Run `npm run dev` and open [the lab](http://localhost:5207/lab/). The gallery links to it. Use the form factor selector for 390 × 844 portrait phone, 844 × 390 landscape phone, 820 × 1180 tablet, 1440 × 900 laptop, and 1920 × 1080 tabletop. The iframe establishes an actual browser viewport, including media queries and viewport units. Review zoom scales the iframe from outside; 100% is the legibility baseline.

## Production parity contract

The lab embeds `/play/`, which mounts `InteractionScene.svelte`. It imports the existing `Component.svelte`, `ArtCard.svelte`, `Abbey.svelte`, `Token.svelte` and `Dice.svelte` renderers. There are no duplicate pieces, screenshot stand-ins or lab versions of controls. The `present` action and `MotionPlayer` live in `src/lib/motion/` and run in the gallery and play surface as well as the lab. Future game integration must mount these same components and dispatch authoritative state into them; do not replace approved interactions with separately implemented copies.

The current state adapter is the existing deterministic presentation adapter, not a complete rules engine. Seeded scenarios allow review before networking and the turn engine exist. Their starting state is explicit and resettable. The gallery explicitly enables the shared board’s audit controls; the play route does not. The `review` parameter enables a same-origin, parent-checked playback transport; it does not change the rendering or action handler. Secret card fronts are inert and hidden from accessibility when turned over. The public table does not mount private scenario pieces.

## Scenarios

| Scenario | Actions to review |
| --- | --- |
| Movement | Direct card choice, selection seal, all four cards visible, Undo |
| Wish / blessing / patrol | Two-sided 3D turn, reverse turn, stable card size, inspect/return |
| Key and medicine | Rejection before key, collection feedback, each Undo |
| Caught | Status change, Walk selection, medicine return, key retention, complete Undo |
| Abbess | Tap/drag to an adjacent map space, tap pawn to turn, on-map Undo; phone pan/zoom |
| Die | Tap the modeled die to generate a local noise result; quaternion interpolation |

Perform an action inside the play surface, then use Replay, Pause, timeline scrubbing or ¼×–2× speed. Playback retains the actual Web Animations objects. It does not dispatch the game action again. New actions cancel retained presentation transforms before measuring their next positions. Reset restores scenario state and clears motion/history. Reduced motion and the OS preference settle directly into the resulting state.

For a private scenario on the table, use the phone companion below the public viewport. Playback controls target that companion. The two views have independent local state; there is no multiplayer synchronization yet. The public table always shows the complete board for private scenarios. The lab’s reviewer-position selector rotates the iframe from outside the play surface, simulating walking around the physical table without changing the game or resetting state. No seat/viewing-edge UI appears inside the game.

## Approval

Approve or mark Needs work only after manual review. Decisions and notes are saved locally per scenario, form factor, acting edge and reduced-motion mode. Export produces a JSON review record. No combinations are approved automatically. A physical 55-inch table review is still required for reach, touch and viewing distance; a laptop preview does not establish those properties.

Run `npm run check`, `npm run test:unit` and `npm run build` after changes. Transport tests cover cancellation, retained handle replay, scrubbing, rate and die-render notification. Native Chrome review checks the live Svelte surface and its browser input behavior.

## Current verification

Native Chrome review exercised portrait-phone selection and wish reversal, landscape-phone collection/rejection/Undo/reset, tablet modeled-die interpolation and timeline scrubbing at 320 ms, laptop Abbess movement from 26 to 19, and public tabletop patrol rotation/turning/inspection. Reduced motion settled directly to the reverse. The west-edge viewport was inspected at 50% after correcting its centering. This is implementation verification, not user approval of every scenario/edge combination. No approval decisions were prefilled. Svelte checks report zero errors/warnings, all 11 unit tests pass, and the static build passes; the existing lazy Three.js chunk size advisory remains.

## Direct-manipulation revision

The board fits the tabletop viewport with no scrollbars. A compact 24-unit pawn body fits within one dot; the contrasting gold pointer and on-map facing label show orientation. Only adjacent destinations receive active 44 px hit targets, and they move the Abbess directly. Pointer capture supports dragging the same pawn to a lit destination and returning invalid drops. Tapping her opens cardinal-facing handles anchored to her position. Motion measurements are recaptured after direct manipulation so accepted drops animate from the live piece rather than a copied ghost. Phone camera controls provide focus, whole-board fit, zoom and background panning. Larger tablet and laptop viewports start with the whole board visible; the table always stays fitted.

Production cards turn when tapped, the movement hand uses a two-by-two phone layout and a four-card landscape layout, and the die itself rolls on tap. Diagnostic face selection remains in the gallery. The actual game has no separate move buttons, board audit panel, fixture-setting buttons or assigned viewing-edge text.

Native Chrome verification of this revision covered tabletop tap-to-move (26 → 19), pawn-facing handles, on-map Undo, and dragging the same pawn from 19 → 20. The full board fit without game scrolling. Portrait and landscape phone movement hands showed all four cards, and the landscape wish used the same ArtCard’s readable side well without overflow. Camera tests check all 155 points in every device fit, phone focus, drop-coordinate round trips, anchored zoom and pan bounds. All 14 tests pass.
