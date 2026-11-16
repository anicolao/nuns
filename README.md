# Nuns on the Run

A browser-based digital adaptation of Fréderic Moyersoen’s **Nuns on the Run** (Mayfair Games, 2010), for **2–8 players**. Novices slip through an abbey after dark, retrieve a secret wish, and race home while the Abbess and Prioress listen, patrol, and give chase.

Designed for phones, tablets, laptops, and a **55-inch horizontal touch table with private phones**. The implementation follows the neighboring Hanami, Pantheon, Can’t Stop, and Istanbul projects: reusable graphical components, deterministic game logic, replayable multiplayer rooms, and small browser-verified delivery slices.

## Current milestone: art direction

This repository currently contains a working **Svelte 5 / SvelteKit / TypeScript / Vite** component gallery, the original board’s movement/sight/hearing foundation, and project documentation. **There is no complete playable game, Firebase connection, room system, or full turn engine yet.** No cloud resources are required to review the art.

- [VISION.md](VISION.md): intended experience, device behavior, privacy, and success criteria.
- [RULES.md](RULES.md): researched base-game summary and verification boundaries.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): sibling implementation review, proposed architecture, and delivery plan.
- [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md): component coverage, direction briefs, and review guide.

## Run the gallery

Node.js 22.18+ (or a compatible newer version) and npm are required.

```sh
npm ci
npm run dev
```

Open **http://localhost:5207/gallery/**. The root URL opens the animation lab. Vite binds to `0.0.0.0` so devices on the same network can use `http://<development-machine-LAN-IP>:5207/gallery/` when allowed by the machine’s firewall. The server’s Network URL gives the actual address.

Review links:

- [Board and topology audit](http://localhost:5207/gallery/?component=board)
- [Movement cards](http://localhost:5207/gallery/?component=movement)
- [Characters](http://localhost:5207/gallery/?component=novices)

Moonlit Storybook is the approved and only art direction. Choose a component, use Enlarge, or inspect the original board’s dots, colored patrols, keys, locks, visibility and hearing. Card trays retain readable sizes and offer previous/next controls. Review actions support Undo and explained rejection. All private information is fixture data.

```sh
npm run check
npm run test:unit
npm run build
npm run preview
```

The production build is static output in `build/`. Preview uses port 4207. Stop a manually started dev server with Ctrl-C.

## Planned implementation

Use SvelteKit’s static adapter and shared typed components, anonymous Firebase Authentication and Firestore rooms, versioned manifests, and pure deterministic reducers. Reconnect reconstructs the game from an immutable history; commands carry expected revisions and retry IDs. Vitest covers rules, emulator tests cover authorization and persistence, and Playwright proves complete multi-browser journeys with screenshots. See the [delivery sequence](docs/ARCHITECTURE.md#delivery-sequence).

Hidden movement needs a deliberate privacy model. The shared table receives public clues and sightings; novice phones own routes, movement choices, wishes, blessings, and logs. Concealing an element with CSS is insufficient. A trusted-client replay prototype must be described honestly: a shared seed and complete history are inspectable by technical players. Real adversarial secrecy requires restricted private streams and a trusted resolver; that decision is an explicit early implementation gate.

## Source and art

Rules research starts with the [published 2010 rulebook](https://www.mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf), cross-checked against the [UltraBoardGames transcription](https://www.ultraboardgames.com/nuns-on-the-run/game-rules.php). The source rules remain authoritative; the summary is not a replacement rulebook.

The graphical pieces use original imagegen artwork assembled into 23 local runtime layers. Source PNGs, character alpha, exact prompts and reproducible crops are retained in `art/` and `static/art/`. Run `npm run art:prepare` to reproduce delivery assets. See [VISUAL_DESIGN.md](VISUAL_DESIGN.md) and [UX_DESIGN_PRINCIPLES.md](UX_DESIGN_PRINCIPLES.md).

The board is reconstructed from original 2010 references: all 155 spaces, 199 undirected connections, colored patrols, locks, key/goal sites and explicit visibility tables. [Board reference and audit notes](docs/BOARD_REFERENCE.md) document the sources and verification. Reference publisher images are research inputs, not shipped artwork. Gameplay topology is independent of the painted underlay. This is an independent project; no official endorsement or release license is claimed. Original project code and generated artwork are licensed under GPL-3.0-only; see [LICENSE](LICENSE). Publisher game names, rules and research reference images are not relicensed. The reused Istanbul dice renderer retains its GPL-3.0-only license; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Review interactions in the [animation lab](http://localhost:5207/lab/), with real phone, tablet, laptop and tabletop viewports. It embeds the shared [play surface](http://localhost:5207/play/), production Svelte pieces and animation presenter. See [docs/ANIMATION_LAB.md](docs/ANIMATION_LAB.md) for scenarios, playback and approval records.

## Review on GitHub

[PR 1 animation lab](https://anicolao.github.io/nuns/pr1/) · [Repository](https://github.com/anicolao/nuns)

Same-repository pull requests publish retained GitHub Pages previews at `/nuns/pr<number>/`. CI checks types, unit tests and a static build before deploying. Build locally for a prefix with `BASE_PATH=/nuns/pr1 npm run build`; the lab, gallery, play frames and artwork share that prefix. The root of each preview opens the animation lab. Publisher reference binaries remain local and ignored; their provenance and original links are in `art/reference/sources.json` and `docs/BOARD_REFERENCE.md`.

Preview deployment restores the previous deployed bundle from the `retained-previews` Actions artifact, overlays the current preview, and publishes directly to Pages. It requires no branch push. Bundles are saved after successful deployment with 90-day retention, refreshed on each deployment. When no retained bundle remains, the workflow bootstraps from the legacy `gh-pages` branch.
