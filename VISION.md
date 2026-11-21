# Nuns on the Run — Vision

## The promise

Make a group feel as though they are creeping through the same sleeping abbey. A novice weighs a longer sprint against a telltale noise. A guard notices a clue, turns a corner, and suddenly gives chase. The computer handles bookkeeping while people supply the bluffing, deduction, and laughter.

The central pleasure is asymmetric information. Novices compete to fulfil individual wishes; the guards work to stop all of them. Automation must preserve uncertainty rather than disclose a hidden route or tell a guard where to search.

## One game across four surfaces

**Phone:** A complete remote-play client, with a navigable public map and a separate private planning view. A novice can inspect her wish, choose a connected route, review noise consequences, commit movement, and consult her log with one hand. A phone at a shared table becomes the private controller. Hidden movement remains on that phone even though the map is also visible on the table.

**Tablet:** The map has more room; private planning can sit beside it where space permits. Touch targets and text stay readable rather than shrinking a laptop dashboard.

**Laptop:** Pointer and keyboard offer the same choices, with explicit route steps, focus states, and accessible component inspection. Hover is an enhancement, never a prerequisite.

**55-inch tabletop:** A horizontal shared map sits at the center of the group. Seats, join invitations, and public aids face their physical edges. Guard movement, patrol selection, public clues, round progression, and revealed cards belong on the table. Novice routes, destinations, wishes, unplayed blessings, and logs stay on phones. Guard blessings also require a private view. Every occupied edge needs readable public information without forcing everyone to face one orientation. The map does not rotate unexpectedly while someone touches it.

These are projections of one rules model. A tabletop is a public device, never an extra player or an all-seeing host dashboard. It can own the room lifecycle without acquiring private information. Phones can reconnect to the same seats without duplicating players.

## Experience principles

### A map first

The abbey’s corridors, doors, facing directions, and clues carry the game. Players reason about routes and sightlines directly on the map. On small screens, pan and zoom preserve legibility and return-to-position controls prevent losing one’s place. Display scale must never alter the logical movement graph.

### Secrets stay with their owners

An unseen novice has no actual position on the public board. A cell placeholder means “not currently visible,” not “located here.” A vanished marker records an exit direction; a noise marker records the direction heard by a guard. Neither exposes a source dot, private route, objective, or movement distance beyond published information.

Personal previews remain local until committed. Public event text, animations, accessibility announcements, URLs, browser telemetry, and reconnect loading states follow the same disclosure rules as the board. Public views receive only public projection data. Trusted-client mode, if used initially, is explicitly a friendly-group trust model, not an anti-cheating guarantee.

### Rules support suspense

Show legal choices and explain a blocked move. Preview public movement and hearing rules without recommending a route or inferring an opponent’s whereabouts. Preserve sight checks at every visited dot and facing change. Resolve simultaneous novice planning as a phase, not a race to tap fastest. Public movement cards reveal only when that phase requires it.

### Calm, tactile, and playful

Characters should read at token scale. Windows, footsteps, keys, and directional clues suggest a warm, mischievous night rather than horror. Motion explains a public event. Hidden motion never crosses the shared screen, and reduced-motion mode resolves the same information immediately. Sound is optional and never carries a clue unavailable visually.

### Recovery is part of play

A dropped connection preserves the room, identity, pending commitments, phase, and accepted choices. Replays use the original manifest version and recorded randomness. A repeated request never moves a guard or rolls a die twice. Undo is limited by information: a local uncommitted path is freely editable; a revealed clue, die, sighting, or blessing cannot be secretly erased.

## Approved visual direction

**Moonlit Storybook:** painted gouache, blue-green night, amber windows, physical painted card edges and expressive die-cut characters. It is the sole direction across all components and screens.

The original abbey topology is a constraint, not an art suggestion. Preserve the same numbered locations, room assignments, connections, doors, sight barriers, colored patrols, locks and key/wish associations. Generate a painting around that footprint and overlay precise gameplay marks from a versioned source manifest. The painting never decides legality or sight. See [docs/BOARD_REFERENCE.md](docs/BOARD_REFERENCE.md), [VISUAL_DESIGN.md](VISUAL_DESIGN.md) and [UX_DESIGN_PRINCIPLES.md](UX_DESIGN_PRINCIPLES.md).

## Delivery and acceptance

Build on the approved gallery and reconstructed original board; lock the remaining card data and privacy boundaries before implementing full play. Deliver complete small journeys: gather a room, plan privately, hear a clue publicly, spot and catch a novice, reconnect, and finish the game. Each slice has deterministic checks and a browser walkthrough using the real components.

Success means:

- Two to eight people can join a private room and complete the base game with consistent outcomes on every device.
- A group can play on the 55-inch table with phones exposing no novice secrets to bystanders through the shared interface.
- Novices understand movement and noise; guards understand facing and public evidence without consulting a second screen for public actions.
- Reloading restores the same accepted state, including outstanding private choices and one-time blessings.
- Keyboard, touch, pointer, screen readers, and reduced motion support the complete game; identity and status never depend on color alone.
- Every card effect, map connection, sight exception, setup count, and victory condition is traceable to a reviewed source and rules test.
- Layouts are verified at phone portrait/landscape, tablet, laptop, and 1920×1080 and 3840×2160 shared-display sizes. Physical touch-table testing verifies reach, seating orientation, and text size; browser dimensions alone do not establish 55-inch usability.

## Boundaries

The initial goal is the published base game for a group of friends, without installation or account setup. Expansions, bots, ranked matchmaking, public chat, monetization, native applications, and a general board-game framework come later if useful. A full faithful map and card inventory must be sourced before calling the implementation rules-complete. The present gallery is an art review milestone, not evidence of complete gameplay.
