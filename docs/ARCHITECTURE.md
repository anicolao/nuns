# Architecture and implementation plan

## Review of neighboring implementations

Reviewed the neighboring repositories’ READMEs, package manifests, source layout, and representative implementation files on 2026-11-13. These are architectural observations, not claims that this new repository already implements their features.

| Project | Implementation evidence | Carry forward |
| --- | --- | --- |
| Hanami | `src/game/engine.js`, `src/game/repository.js`, README, package manifest: plain Vite/JavaScript, versioned choice replay, Firebase transactions, QR/tabletop play, original watercolor assets, gallery and animation fixtures. | Gallery-first delivery, commands as choices, seed/version preservation, reconnect identity, real component reuse. Hanami is not SvelteKit. |
| Pantheon | README, VISION, `src/lib/backend/setup-repository.ts`, package manifest and `src/lib/tabletop/README.md`: SvelteKit, illustrated card gallery/printing, event-based rooms, private hands, physical edge layouts, Nix tooling, browser walkthroughs. | Stable card IDs, face/back families, private projection boundaries, edge-aware tabletop controls. |
| Can’t Stop | README, `src/game/engine.ts`, `src/lib/scene/*`, package manifest: Svelte 5 with Threlte/Three geometry, deterministic versioned intents, shared scene materials, gallery and motion lab. | Share production renderers with review fixtures; separate model from presentation; keep device and motion studies reviewable. WebGL is not needed for Nuns’ first 2D slice. |
| Istanbul | README, VISION, `src/routes/gallery/+page.svelte`, package manifest: static SvelteKit, typed manifests and reducers, anonymous Firebase rooms, immutable event stream, emulator/Playwright scenarios, public table and private phone controllers. | Closest structural template: component gallery, static client, room persistence, testable rules, public-table/private-phone split. |

Use these projects as references, without copying their room IDs, Firebase configuration, generated art, deployment credentials, or launcher registrations.

## Proposed boundaries

Current files implement the **presentation milestone and original board foundation**:

- `src/lib/catalog.ts`: typed, stable component inventory and original direction briefs.
- `src/lib/components/{Abbey,ArtCard,Piece,Token,Component}.svelte`: shared graphical renderers composing imagegen layers with live values.
- `src/lib/review.ts`: deterministic typed fixture adapter with acceptance and rejection.
- `art/` and `static/art/`: original source paintings, exact prompts, crop manifest and 19 runtime graphical layers.
- `src/lib/Gallery.svelte`: fixtures, filters, comparison, inspector, and device studies.
- `src/routes/` and `src/app.css`: static routes and responsive presentation.

The original board’s 155 dots, connections, barriers, patrols, locks, keys, explicit sight tables and pure board queries are now implemented under `src/lib/game/`. See [BOARD_REFERENCE.md](BOARD_REFERENCE.md). Full turn rules and multiplayer remain future work.

As gameplay is added, introduce these boundaries:

1. `game/manifests`: edition version, graph nodes/edges, door properties, sight metadata, patrols, wishes, blessings, setup counts. Logical topology is independent of pixels and artwork.
2. `game/engine`: pure typed commands and deterministic reducers; phase machine, legality, facing, shortest paths, hearing, sight, capture, objectives, and victory.
3. `game/projections`: public table, novice owner, guard owner, and observer views. Public components accept public types and never inspect complete game state.
4. `game/repository`: authentication, ordered append-only persistence, expected revisions, immutable command receipts, idempotent retry and reconnect. Firestore Security Rules enforce attribution and immutable authorized records.
5. `presentation`: board, pieces, cards, private route planner, clues, public history, accessible alternatives, motion derived from accepted transitions. Gallery fixtures use these same components as they become production-ready.

Future routes: `/play/` for remote rooms, `/tabletop/` for the public display, and a seat-bound `/controller/` phone view. `/play/` currently hosts shared presentation interactions, including the board encounter slice; it is not a networked room. `/tabletop/` and `/controller/` do not exist yet. `/` opens the animation lab, and `/gallery/` shows the art review.

## Privacy decision

The siblings often replay complete state on trusted clients. Nuns makes hidden location the central mechanic, so this tradeoff must be explicit.

**Friendly-group prototype:** Full replay can run locally and render restricted projections. This prevents accidental UI disclosure but technical players can inspect state and future seeded draws. A public-only component API still prevents clues from leaking through markup and animation, but cannot make downloaded secrets inaccessible.

**Protected multiplayer:** Separate owner-readable private records from public events, and use a trusted resolver with permission to evaluate all hidden paths, hearing, and visibility. Clients submit private commands; the resolver atomically publishes permitted consequences and returns owner-specific results. Public clients never receive private paths or the seed for secret deals. Use recorded random outcomes with restricted access as appropriate. A public replay alone is intentionally insufficient to reconstruct every private state; authorized resolver history reconstructs the full game, and player views reconstruct only their allowed information.

Choose and document the initial mode in slice 1 before multiplayer implementation. The frontend remains statically hostable in either case; protected secrecy adds a backend resolver. Do not claim that Firestore rules or CSS hiding turn a full shared event log into secure hidden movement. Do not put private coordinates in public commands, IDs, URL parameters, error messages, announcements, or analytics.

## Delivery sequence

| Slice | Concrete result | Acceptance evidence |
| --- | --- | --- |
| 0 · Art review (current) | Moonlit Storybook, fourteen component families, inspector, responsive studies and original-board audit. | Type check, fixture unit tests, static build, native Chrome desktop/390 px inspection. No game claims. |
| 1 · Rules and privacy contract | Reviewed board/card manifests, ambiguity register, public/private schema, chosen trust model. | Graph integrity, source-linked card inventory, special sight fixtures, prototype privacy test. |
| 2 · Rooms and seats | Anonymous create/join, role allocation for 2–8, QR/table invitation, private ownership, reload. | Real emulator-backed multi-browser join/reconnect; wrong-owner and public access tests. |
| 3 · A secret step | Simultaneous novice planning, first-round double move, public speed reveal, key pickup. | Two novices commit independently; neither gets the other’s route; replay and duplicate retry checks. |
| 4 · A listening patrol | Guard paths, facing, intermediate sight, both hearing phases, clue directions and lifetime. | A guard changes course from legal evidence; negative assertions for hidden endpoint leaks. |
| 5 · Caught and back out | Capture points, return-home status, keys retained, wish lost and recollected. | Full caught-state recovery journey and all victory/tie boundaries. |
| 6 · Blessings and complete game | Every verified blessing, objectives, 15-round limit, end state and rematch. | Deterministic coverage of each card and complete 2-, 7-, and 8-player sessions. |
| 7 · Tabletop and device completion | Public 55-inch play, physical seats, private phones, disconnect recovery, accessibility. | Phone portrait/landscape, tablet, laptop, 1080p/4K shared display; real hardware review. |

Tabletop privacy architecture and responsive sizing begin in earlier slices; slice 7 verifies the complete experience. Prefer a local, editable route preview over undoing revealed information. Cross-player or information-revealing rollback needs an explicit design and must never reroll a resolved outcome.

## Verification and deployment

Current checks: `npm run check`, `npm run test:unit` and `npm run build`. `npm run art:prepare` reproduces prepared assets from retained imagegen sources. The gallery needs no emulator. Package versions and `package-lock.json` are committed inputs. The first source-data slice should add a pinned Nix environment consistent with the sibling projects, including Java for emulators, rather than implying one exists now.

Add Vitest with the rules module, Firebase emulator tests with persistence, and Playwright with the first playable journey. Walkthroughs record user actions, private/public state assertions and screenshots from the actual routes. Test both allowed disclosure and absence of hidden data, plus stale revisions, duplicate requests, lost acknowledgements, and reload. Fixtures must not bypass the engine in gameplay tests. Keep reviewed visual baselines explicit.

Target static hosting and retained PR previews in the sibling model, with isolated Firebase scopes. Deployment and live Firebase setup are future milestones; no infrastructure or hosting was provisioned for the gallery.
