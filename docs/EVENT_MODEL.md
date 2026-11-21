# Event-sourced game contract

Reference implementations reviewed: [Istanbul protocol and repository](https://github.com/anicolao/istanbul/tree/main/src/lib/game), [Hanami repository](https://github.com/anicolao/hanami/blob/main/src/game/repository.js), and [RoboRally room service](https://github.com/anicolao/roborally/blob/main/src/lib/room-service.ts). Carry forward versioned inputs, deterministic replay, attributed immutable history, durable retries, role projections, and emulator-backed browser journeys. The requested persistence service here is Realtime Database.

`game/model.ts` defines input version 2 and edition `mayfair-2010-v2`. `engine.ts` accepts only actor-authored inputs: room/seating/readiness, setup seed, patrol selections, novice routes/speeds, guard steps/speeds, die outcomes, blessing choices, roll confirmation, round advance and rematch. One setup seed determines unique wishes and the finite eight-card blessing deal. Dice are unbiased client-generated facts persisted once. Reducers derive everything else, including first-round double movement, intermediate sightings and vanished clues, directional hearing, captures, keys/items, recovery, winners and rematches.

Novices commit independently against the same movement barrier. Public speeds reveal at the barrier, and all same-phase finishers are compared by capture count. Each first-round segment uses the same card. Route edits are local until commit. Committed/revealed input history is never rewritten. Version 2 adds an explicit first-turn undo input: before any guard acts, a novice may restore her initial position and repeat both first-round moves. Other novices retain their submissions at the barrier. Round 2 and later do not allow committed-turn undo. A rematch is a new epoch in the existing history.

Each guard has independent ownership, speed, facing, steps, hearing status, active patrol and blessing. With two to seven players one UID controls both; at eight, each guard has its own UID. A tabletop host can execute public guard actions; private blessings remain on their owners' devices. Patrols are followed until qualifying per-guard evidence allows diversion; absent evidence, shortest routes rejoin the remaining patrol. Mandatory turns inspect sight before the next step. Guard movement can continue after a capture. Old clues expire after both guards finish, before the new hearing checks.

Four blessing effects have two copies each: Extra Move, noise-distance adjustment, re-roll, False Noise. Noise modifiers and re-rolls act on a pending die result before its explicit resolution. False Noise targets an adjacent direction beside either guard; a novice's card identity reveals in the corresponding phase of the next turn. Guard and novice cards use the same renderer as the gallery.

## Source and interpretation register

The [2010 English rulebook](https://www.mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf) is the base authority. The [designer-associated French rules and card translation](https://www.jeuxavolonte.asso.fr/regles/nuns_on_the_run.pdf), final page, supply the complete eight-card effect inventory and the two About Turn patrol cards described on page 4. Publisher artwork is not shipped.

The edition makes these interpretations explicit:

- Running novices move 1–5; Extra Move makes Sneak 2–3, Walk 4–5, Run 1–6. Optional exact-five running is disabled.
- Guards have the shared fourteen route cards plus two About Turn cards. About Turn reverses the assigned path without inventing new graph edges. Used cards leave the available pool.
- A diverted guard rejoins the closest point in the remaining suffix of her route and continues in its existing direction; equally short return steps are selectable.
- A caught novice cannot be captured again during protected recovery. She follows shortest steps toward home, becomes free at her current location as soon as she is unseen (including during the walk), and resumes normal movement there; she is never teleported. Capture protection lasts through that round. Home cells do not score captures.
- Equal shortest sound paths publish both permitted direction clues. Each eligible guard gets its own clues.
- Distance adjustment is scoped to the assigned guard's hearing or the novice owner's noise. Re-roll replaces the current pending fact using the played card; it never rewrites a persisted outcome.
- All novice submissions at a barrier are resolved before novice winners are selected; lowest capture count breaks simultaneous ties. Guard capture victory resolves immediately, and round 15 closes with guard victory otherwise.

Version 1 inputs retain their original recovery behavior during replay; all new inputs use version 2. Existing histories remain readable, including mixed-version streams. Chosen patrol paths and committed novice speeds are public in the map, information panel and log.

A change to these interpretations or manifests requires a version bump, fixtures, browser evidence, and review. `publicGame` excludes seeds, private wishes, acquired-item status, private routes and unplayed blessing identities. A separate owner view supplies private controls. The transport remains the trusted-client model documented in FIREBASE.md.

## Lab parity

`MovementHand` is the only speed-card hand. The movement bench, novice planning step and live rooms mount that component. The full board scenarios mount the same `GameSurface` used by network rooms. Their explicit starting positions live in `lab/fixtures.ts`; all subsequent actions pass through `applyEvent`/`applyIntent`. The former independent encounter reducer and duplicate selector were removed. Replay, seek and reduced motion use the same animation presenter. Lab-only next-phase controls execute legal fixture inputs outside the play surface.
