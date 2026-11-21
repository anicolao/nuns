# Firebase operations

Project: `nuns-anicolao`. Anonymous Authentication and Firebase **Realtime Database** in `us-central1`; no Firestore, Cloud Functions, or game server.

- Web app: `1:481010513811:web:db21f66ac24e7a38695a66` (`Nuns Web`).
- Database: `https://nuns-anicolao-default-rtdb.firebaseio.com`.
- Browser configuration: `src/lib/firebase-config.json` (public metadata).
- Anonymous sign-in enabled through the Firebase CLI; authorized domains include `localhost` and `anicolao.github.io`.
- The existing operator CLI account is `alex@boardgamescafe.org`, with access to the anicolao reference projects. No credentials belong in this repository, Pages artifacts, or CI.

Use the pinned toolchain:

```sh
nix develop
npm ci
npx firebase login --interactive       # only if the CLI has no authenticated account
npx firebase deploy --only auth --project nuns-anicolao
node scripts/configure-auth.mjs
npm run test:backend
npx firebase deploy --only database --project nuns-anicolao
node scripts/verify-firebase.mjs
```

`verify-firebase.mjs` creates and deletes its own temporary anonymous Auth user and performs read-only database probes. It prints no tokens or room contents. `configure-auth.mjs` uses the CLI login in memory and preserves existing authorized domains.

The project was provisioned with `firebase projects:create`, `firebase apps:create WEB`, and `firebase init database --interactive` (default instance, `us-central1`). The explicit interactive flag is needed because the CLI otherwise suppresses prompts when run by a coding agent. Existing rule files must be preserved during initialization.

## Immutable history

`rooms/{CODE}/events/{sequence}` is the only application data. Each event contains version, sequence, actor UID, stable retry ID and one input intent. There are no stored game-state snapshots, phase counters, derived captures, or server result records. A transaction reserves the next immutable slot. A conflict fetches and replays the current prefix, revalidates the unchanged input, and reserves a new slot with the same retry ID. Illegal stale choices require a fresh choice. Lost acknowledgements retry the retained ID; they do not roll new dice.

Rules require authentication, attribution, contiguous sequence slots, supported input versions (legacy 1 and current 2) and allowed envelope fields; event overwrites, deletes, parent writes, computed-state siblings and collection browsing are denied. Rules are tested against the emulator before deployment. PR CI gets no administrative Firebase credentials.

As in Istanbul, Hanami and RoboRally, clients are trusted to run game legality. An authenticated person with an invitation code can read the full input history, including hidden routes and setup seed. Role-specific component projections keep these out of ordinary public markup and controls. This is not adversarial secrecy or server-side move validation. Preview and main builds use the same project and room codes; incompatible event versions stop replay rather than reinterpret old games.

## Emulators

`npm run emulators` starts Auth on 9297 and Realtime Database on 9197 under the isolated `demo-nuns` project. Run `VITE_USE_FIREBASE_EMULATORS=true npm run dev` for local play, or `npm run test:backend` to start services, run rules/repository tests, and exercise multi-browser games. Tests never fall back to production. Anonymous identity persists in the browser across reloads; clearing browser storage loses the original seat.
