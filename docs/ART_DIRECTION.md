# Moonlit Storybook

Moonlit Storybook is the approved and sole art direction. The workbench at `/gallery/` and `/` contains the shared graphical components, inspection and reversible interaction fixtures.

## Construction

Painted gouache, amber light, cool stone, expressive nun standees and ivory die-cut edges carry the physical appearance. HTML supplies live names, numbers and rules; a generated transparent corner seal marks selection. `ArtCard`, `Piece`, `Token`, `Abbey` and `Component` are shared by the collection, table and inspector.

The retained component atlas, transparent character sheet and canonical board painting produce **23 runtime WebP layers**. The earlier Moonlit board remains a style input only and is not used by the renderer. The exact component prompts are in [art/prompts.json](../art/prompts.json); the reference-constrained board edit is in [art/board-rebuild-prompt.txt](../art/board-rebuild-prompt.txt). Built-in `image_gen.imagegen` was used throughout. Source PNGs remain in [art/sources/](../art/sources/), delivery assets in [static/art/moonlit/](../static/art/moonlit/), and crop provenance in [art/manifest.json](../art/manifest.json).

Run `npm run art:prepare` to reproduce crops, alpha-preserving character trims and WebP encoding. This command does not generate or redraw art. Publisher reference images are kept separately under `art/reference/` and are not runtime artwork.

## Board

The accepted board painting follows the original 2010 abbey layout. Exact numbers, connections, colored patrols, keys, locks, wish sites, endpoints and room labels are separate overlays. Movement, visibility and hearing use the same factual manifest. See [BOARD_REFERENCE.md](BOARD_REFERENCE.md) for sources, normalization, rules precedence, counts and verification.

The board workbench includes a readable map with selectable dots, larger table sizes, an orientation overview, patrol filters, facing, visibility, hearing and barrier inspection. Card/figure/token review retains the existing actual-size components. The character names and numbers now follow the original cells: Anne Marie 1, Margaret 2, Theresa 3, Celeste 4, Angelica 5, Bernadette 6.

## Component coverage and limits

The collection contains board, six novices, two guards, four novice speed cards, sample wish and blessing, source patrol, reverse study, clue tokens, status, night/capture aid, die, private log and key/item progress. Movement cards share a painted frame with distinct Still, Sneak, Walk and Run scenes, registered title/rules wells and separate exact values. Wish and blessing cards use larger rules text. The patrol card replaces figurative illustration with a minimap of its canonical route. One card reverse is provided; distinct deck-family reverses remain future work. The sample blessing is Extra Move; its effect is displayed but not resolved by a game engine. The sample log’s movement distances now follow the original graph.

Gallery choices use a typed deterministic adapter, with full-snapshot Undo and explained rejection. The board uses original adjacency; status/collection changes still demonstrate presentation contracts rather than the complete phase machine. No multiplayer or full game is claimed.

## Review evidence

Native Chrome desktop inspection covered the new painting and numbered/colored overlays together, plus a selected chapel dot’s location, neighbors and sound distance. Previous Moonlit review at actual 390 × 844 checked readable movement cards, next/previous tray controls, selection and inspector return. Type checks, board and fixture unit tests, and a static build are required.

Real tabletop reach/orientation, grayscale recognition, full tablet/landscape coverage and complete-game integration remain separate acceptance work. Tool-returned screenshots are observations, not saved regression baselines or human recognition approval.

## Card revision

The four gait scenes and transparent selection seal were generated with built-in imagegen. Exact prompts are retained in [art/card-revision-prompts.json](../art/card-revision-prompts.json), with source PNGs in `art/sources/`. The noise die now uses the rounded ruby Three.js renderer adapted from Istanbul, itself derived from Can’t Stop. All six faces can be previewed; this does not roll or resolve a turn. See [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) for attribution and license. Desktop review covered all revised card faces and die face switching. A fresh 390 × 844 phone review confirmed movement tray readability and wish title/rules containment. Svelte checks passed with zero errors or warnings; all nine unit tests and the static build passed. The lazy Three.js chunk produces Vite’s size advisory (527 kB before gzip).
