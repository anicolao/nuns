# Nuns on the Run

A browser-based digital adaptation of Fréderic Moyersoen’s **Nuns on the Run** (Mayfair Games, 2010), for **2–8 players**. Novices slip through a moonlit abbey, retrieve a secret wish, and get home while the Abbess and Prioress listen, patrol, and give chase.

## Play

Open the entrance, create a room, and share its six-character code or QR invitation. Choose a novice or guard seat, mark ready, and let the host start. One player controls both guards through seven players; an eight-player room has two guard players and six novices.

Novices choose among the illustrated movement cards, plan directly on their private maps, edit uncommitted steps, and commit. Both first-round moves use the same card. Their key and wish are collected automatically at the appropriate locations. Chosen patrol routes and committed novice movement speeds are public, including in the game log. Map toggles show visibility barriers and the spaces visible to each guard. Guards select patrols, move by tapping or dragging their pieces, finish their walking/running movement, and resolve hearing. Sight, vanished and noise clues, captures, recovery, the 15-round limit, ties and rematches come from the same deterministic reducer.

All four blessing effects are available from the private hand: Extra Move, noise-distance adjustment, re-roll and False Noise. A pending die result leaves time for a blessing before hearing resolves. False Noise is targeted on the map and its identity stays concealed until the specified delayed reveal.

Routes:

- `/`: create or join a personal-screen game.
- `/play/?room=CODE`: reopen a room.
- `/tabletop/`: create a public shared display; players join on their phones.
- `/controller/?room=CODE`: private phone entry.
- `/lab/`: animation and production interaction review.
- `/gallery/`: original Moonlit Storybook component inventory.

The shared display exposes public guard actions while wishes, novice routes and private blessing decisions stay on their owners’ phones. Reloading restores the same anonymous seat and reconstructs play from immutable history. Route edits can be undone before commit. On the first turn only, novices can also undo both movements until a guard acts; the undo is an explicit event and never rewrites history. Caught novices become free at their current location as soon as no guard can see them, including during their walk.

## Development and verification

Use the pinned Nix flake for Node 24, Java 21 and a Chromium binary:

```sh
nix develop
npm ci
npm run dev
```

Vite uses port **5207**, with LAN access for device review. `npm run preview` serves the production build on **4207**. Node 24.12+ and Java 21 can also be supplied outside Nix; `firebase-tools` is a pinned npm dependency.

```sh
npm run check
npm run test:unit
npm run test:backend
npm run build
npm run test:browser
```

`test:backend` starts isolated Auth/Realtime Database emulators and runs rules, retry/concurrency, and actual multi-browser gameplay journeys. It covers create/join/reload, complete guard and novice victories, rematch, and eight anonymous players committing simultaneously. `test:browser` exercises production components at phone portrait/landscape, tablet, laptop and tabletop sizes, normal/reduced motion, scrubbing, and public/private phone projection at all four tabletop acting edges. Run `npx playwright install chromium` when not using the flake’s browser.

For manual emulator play:

```sh
npm run emulators
# In a second shell:
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```

`BASE_PATH=/nuns/pr1 npm run build` produces the GitHub Pages prefix. CI checks types, rules, reducer and browser journeys before deploying. A live revision probe prevents a stale preview from reporting success. Previews are retained in deployment artifacts; publishing needs no repository-branch push. See [FIREBASE.md](FIREBASE.md) for the deployed backend and operator commands.

## Architecture and review

Realtime Database stores only versioned actor inputs at `rooms/{CODE}/events/{sequence}`. Pure replay derives the game. Transactions reserve immutable sequence slots; conflicts replay and revalidate, and lost acknowledgements reuse a durable retry ID. This follows the trusted-client event-sourced model used by [Istanbul](https://github.com/anicolao/istanbul), [Hanami](https://github.com/anicolao/hanami) and [RoboRally](https://github.com/anicolao/roborally), with Realtime Database as requested.

Authentication and rules provide attribution, continuity and immutability. Authenticated invitation holders can inspect the full replay log, including hidden routes and setup randomness. Private projections prevent ordinary UI disclosure; they do not provide adversarial secrecy. There is no game server or Cloud Functions deployment.

The lab and game mount the same `GameSurface`, `MovementHand`, board, cards, pieces, controls, presenter and reducer. The former independent encounter reducer and duplicate movement selector were removed. Lab seeds are explicit positions; every subsequent action follows the production reducer. The standalone card bench uses exactly the same movement hand as the novice’s first planning step.

- [Event model and edition interpretations](docs/EVENT_MODEL.md)
- [Lab guide](docs/ANIMATION_LAB.md)
- [Rules summary](RULES.md)
- [Original-board audit](docs/BOARD_REFERENCE.md)
- [Experience and device vision](VISION.md)

Physical 55-inch touch-table reach and viewing-distance approval remains a hardware review; scaled browser previews do not establish it. Computer players, expansions, optional variants and matchmaking are outside this base-game implementation.

## Source and art

The source rules are the [published 2010 English rulebook](https://www.mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf). The complete blessing inventory and About Turn cards are cross-checked against the [designer-associated French rules/card translation](https://www.jeuxavolonte.asso.fr/regles/nuns_on_the_run.pdf). Interpretation boundaries are recorded in the event-model document.

The original board foundation retains all 155 spaces, 199 undirected connections, colored patrols, locks, keys and explicit visibility tables. Logical topology is independent of the painted underlay. Original generated Moonlit Storybook sources, exact prompts and reproducible crops are retained in `art/` and `static/art/`; `npm run art:prepare` regenerates delivery assets.

This is an independent project with no official endorsement. Original code and generated artwork are GPL-3.0-only; see [LICENSE](LICENSE). Publisher names, rules and reference images are not relicensed. The reused Istanbul dice renderer retains its GPL-3.0-only license; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
