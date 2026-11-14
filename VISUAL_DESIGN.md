# Nuns on the Run visual standard

Physical pieces use imagegen-created material, silhouettes, frames and illustration. Code-authored SVG characters and CSS card borders are not the production art direction. This standard adapts all eight supplied UX/visual documents in `../gaiaproject`, `../istanbul`, `../supermega` and `../vianova`.

## Approved direction

Moonlit Storybook is the sole direction: painted gouache, blue stone, amber candlelight, expressive figures and ivory die-cut rims. The original component atlas, character sheet and reference-constrained board painting supply 23 runtime layers. Preserve source PNGs and prompts in `art/`; use `npm run art:prepare` for reproducible preparation.

The board must preserve the original 155 dots, room positions, graph, barriers, locks, colored routes and key/wish associations. These are precise overlays and source data, not details left to image generation. See [docs/BOARD_REFERENCE.md](docs/BOARD_REFERENCE.md). The prior Moonlit board is retained only as the style reference for the corrected painting.

## Assembly

`ArtCard`, `Piece`, `Token`, `Abbey` and `Component` are shared graphical renderers. Painted bodies sit below independent live titles, values, rules and input indicators. The same assets and coordinates are used in the collection, contextual table and inspector. Title, illustration and rules use shared measured wells in `card-layout.ts`. Titles stay at 18–21 px and rules at 18–20 px. Text must remain inside the quiet painted well. Do not bake names, move counts, ownership, targets or state into raster art.

Generated assets may be cropped and encoded for delivery, without redrawing them in code or flattening live state. Transparent character padding is trimmed before delivery; source alpha is preserved. No remote artwork or fonts are required at runtime.

## Size budget at 100% zoom

| Object | Starting minimum | Information to preserve |
| --- | --- | --- |
| Card | 320 px; movement tray 260 px | Title, distance, modifier or complete sample objective |
| Character | 120 px visible height; collection 245 px | Face, habit silhouette, unique prop, name/number below |
| Clue / objective token | 80 px normal review; contextual clue 64 px | Distinct subject and clue direction |
| Map | 1300 px readable width in a scrollable map region | Readable rooms, 44 px nodes, 16 px dot labels, guard facing |
| Player aid | Reflow inside available column | 16 px values, 14 px required text |
| Primary action | 44 × 44 px | Focus and activation without overlapping neighbors |

These are design budgets, not recognition approval. Phone trays scroll instead of scaling all four cards down. Map precision remains in the map surface. Gameplay-supporting text is at least 14 px, with 16–28 px primary values; small provenance and fixture annotations are supplementary. The current labeled contextual clues are 64 px for scene balance and remain subject to physical-table review.

## Hierarchy

Identity and silhouette come first; rules and values second; material third. Keep quiet parchment beneath text. Avoid decorative framing outside already painted pieces. Live focus and selection must not resemble ownership or extra game tokens. Six novices have different poses, faces and props, with persistent numeric identities; habit color is supplemental.

Use the same graphical token for the same concept on a card, aid and table. A bell represents noise; a departing silhouette represents vanished; key and bottle retain their own shapes. Standees are physical pieces with alpha around their silhouette. Decorative architecture is not a movement graph.

## Review obligations

Inspect the shared components at desktop and actual 390 px widths, plus a crowded contextual table. Check normal and enlarged renderings, text containment, same-object selection and reverse state, direct choice, rejection and Undo. Keyboard return and reduced motion must preserve identity.

Physical 55-inch viewing distance, reach, four-edge orientation, grayscale recognition and complete tablet/landscape coverage remain separate acceptance checks. No all-clear claim follows merely from a successful build. Current browser observations and remaining gaps are in [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md).

The noise die reuses Istanbul’s Can’t Stop-derived Three.js geometry and materials, with a lazy renderer and textual fallback. Movement cards use four distinct generated gait scenes; selection uses a transparent corner seal. Patrol cards show the exact route on a minimap.

## Board interaction scale

Use the shared compact Abbess pawn: its body occupies 24 map units, below the 34-unit minimum separation between original spaces. A contrasting gold pointer sits in front of the body; the on-board label names its cardinal facing. Legal destinations have 44 px input targets independent of the map scale. Fit the entire map on the tabletop with no scrolling; phone cameras provide close-up pan/zoom. Map actions, facing handles and Undo overlay the board. The lab rotates the preview externally to simulate a viewer’s position; the production surface has no viewing-edge UI. All four movement cards fit the phone hand; short landscape card views pair the complete scaled painted card with a readable rules well from the same ArtCard component.
