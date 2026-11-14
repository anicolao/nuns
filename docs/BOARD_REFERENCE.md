# Original board reconstruction

This project targets the **2010 English Mayfair edition**. Moonlit Storybook changes the painting; the numbered map and gameplay relationships are source data.

## References

1. [Nuns on the Run Online](https://www.mind-maze.uk/nuns-on-the-run/) describes itself as an official free-to-play implementation. Its board underlay and declarative map records supply coordinates, connections, walls, key/goal sites, locks, bent connections, room labels and patrol paths. The application code is not vendored or used as our rules engine.
2. [Mayfair’s published English rules](https://www.mind-maze.uk/nuns-on-the-run/rules/notr-rules.pdf), especially the four visibility tables and their group statements on page 8, supply explicit visibility constraints and special hiding places. These take precedence over geometric approximation and community utilities.
3. [Roy Lazarovich’s line-of-sight utility](https://boardgamegeek.com/filepage/71712/nuns-on-the-run-line-of-sight-utility), with its [online version](https://boardit.no/tools/nuns/los/) hosted by Tor Sverre Lund, provides an independent map/coordinate check. Its visibility lists are a secondary check, not the authority.

Reference images and rules are retained under `art/reference/` for reconstruction and verification; they are not served as game artwork. Their URLs, retrieval date and SHA-256 hashes are in [sources.json](../art/reference/sources.json). The runtime board painting is original imagegen artwork.

## Retained facts

| Feature | Retained data |
| --- | --- |
| Coordinate space | 1000 × 1038; original upright orientation |
| Numbered spaces | 1–155, exact source positions |
| Connections | 199 undirected edges, including sound through doors |
| Bent connections | 10; intermediate drawing points do not cost additional movement |
| Sight barriers | 64 line segments, including doors and the irregular altar/cloister boundaries |
| Colored locks | 10: blue 2, green 2, red 1, yellow 2, white 3 |
| Key sites | 8: dots 10, 36, 82, 107, 130, 149, 67 and 72 |
| Wish sites | 7 distinct destinations: 155, 148, 118, 119, 121, 109 and 110; two wishes share 121 |
| Patrol paths | 14 nonempty colored paths, using blue, green, purple, red and orange |
| Patrol endpoints | 26, 84, 101, 122, 147 |
| Explicit sight results | 681 printed table cells; 897 distinct pairs including printed all-visible groups |
| Special hidden dots | Tree 82 and confessionals 103/107; co-location required |

The reference source has three one-sided connection declarations: 45–46, 67–68 and 76–77. Its runtime makes connections undirected. Our normalization preserves that behavior explicitly rather than dropping those passages. Its route array also contains two empty bookkeeping slots; these are not drawn as invented patrol paths.

## How the artwork stays faithful

The imagegen edit uses the original underlay as its structural target and the accepted Moonlit painting only as a style reference. It preserves the original room footprint, chapel, gardens, cloister, cells, doorways and partitions. The exact prompt is [board-rebuild-prompt.txt](../art/board-rebuild-prompt.txt).

`board-manifest.json` is the logical authority. The renderer places **every number at its original coordinate**, then draws all connections, parallel colored patrol lanes, door marks, colored key IDs, locks, objective colors and patrol endpoints. The painting contains no numbers or route markers. The same manifest drives interaction and audit results, so moving an illustration cannot silently create a passage, hide a lock or change a sightline.

Patrol strokes use parallel colored lanes on shared edges. Their shadow filter uses explicit map-space bounds: an object-bounding-box filter can clip perfectly horizontal or vertical lines. Native Chrome review confirmed straight and diagonal patrol segments remain visible after this correction.

Original lock colors are retained as categorical identities. Display colors are brightened for the blue night painting. Both keys and wish destinations carry their original color association. Eight key IDs remain distinct even when their colors or destinations are shared.

## Movement, hearing and sight

Movement uses undirected edges. Novices without a key cannot traverse a locked edge; possessing the assigned key permits all locks, as specified in the rules. Guards have keys. Sound uses the same graph **with doors traversable**, independent of novice key possession. BFS gives exact step distance and all shortest-path first hops for directional noise. No Euclidean shortcuts through walls are permitted.

Sight first considers explicit rulebook results, then source barrier intersections for unlisted pairs. It additionally applies the six-edge distance limit, hiding-place rules and a forward 180° arc. The printed tables describe clear sight; range and facing remain separate constraints. For example, 35–84 is marked clear in the table but is outside six movement edges, so it is not currently visible.

The independent utility disagrees on 22 pairs after distance filtering: 19 involve the tree, two are contradicted by printed table cells, and one is an unlisted geometric boundary case (31–50). We follow the explicit same-dot tree rule, printed cells and source barrier geometry respectively. The difference is retained here rather than treating utility agreement as proof of correctness. Full-board human checking remains useful, particularly near exact wall endpoints.

## Review and verification

Open `/gallery/?component=board`. Select dots, inspect connected neighbors, set facing, toggle sight/hearing/barriers, filter patrols, and adjust hearing rolls and novice noise. A connected move changes the Abbess through the shared fixture adapter; Undo restores her exact previous position and facing. Selection itself is inspection, not a game event.

Readable mode is 1300 px wide: the closest dot centers are 44.2 CSS pixels apart and input targets are 44 px. Larger table modes preserve the same coordinates. Overview is for orientation; dot input is disabled there. Pan within the explicitly scrollable board rather than shrinking the whole map for phone play.

`tests/board.test.ts` covers all original dots, normalized connections, every patrol step, lock/key references, all 897 explicit sight pairs, range/facing, hidden places, open passages, sound through doors, bent-edge cost and source example distances. `scripts/research/extract-sight-tables.py` reproduces the page-8 table transcription from the retained PDF using glyph coordinates; Python/PyMuPDF is needed only for that research command.

Native Chrome review confirmed that selecting dot 130 identifies Chapel, its neighbors 114/129/131, and the 12-edge distance from the initial guard at 26. The rendered painting and overlays were inspected together at desktop size. Real 55-inch touch, grayscale and full edge-case recognition checks remain outstanding. This module is the board foundation, not a complete turn/capture/blessing game engine.
