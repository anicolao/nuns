# Nuns on the Run UX principles

Adopted from the Gaia Project, Istanbul, Supermega and Via Nova standards reviewed on 2026-11-13. See [VISUAL_DESIGN.md](VISUAL_DESIGN.md) for graphical construction and actual-size review.

- Build physical game components from original imagegen artwork: boards, card bodies, standees, tokens and aids. HTML supplies layout, accessible controls and accurate live information.
- Use one shared renderer in the collection, contextual table and inspector. Fixtures supply state and receive typed choices; presentation never becomes the game authority.
- Touch the actual object. Movement cards select themselves; board destinations move the selected guard; status flips on the status piece. Ordinary reversible review actions happen directly, with persistent Undo.
- Undo restores the entire prior snapshot, including facing, selected movement, collected items and individual card reverses. Reject an unavailable choice without mutating state or adding an undo step.
- Preserve exact object identity and state through browsing, enlargement and return. Card reverses belong to individual card IDs. Escape closes inspection and restores focus to its opener.
- Keep public and private information distinct. The public contextual fixture contains guard positions, clues and a patrol study. Wishes and movement selection belong to the explicit private fixture. Character references below the public map are a labeled art collection, not hidden novice positions.
- Recompose at phone sizes. Cards retain their readable width in an explicit tray; figures retain their visible height; the map remains a readable map in an explicitly scrollable region. Do not make a miniature desktop or require inspection to read basic values.
- Keep the workbench inside the viewport, with designated scrollable review surfaces. Provide visible next/previous controls for the movement-card tray and a visible return from inspection. Ordinary navigation stays subordinate to pieces.
- Provide keyboard activation, clear focus, 44 px action targets, text and shape distinctions, and reduced-motion scrolling. Do not invent targeting, confirmation or game states merely for a generic checklist.
- Keep fixtures honest. The board uses original topology, sight tables and sound paths. Collection and caught-state changes still demonstrate interaction contracts, not the complete published phase rules. No network, full rules engine or tabletop hardware approval is implied.

## Acceptance

Exercise direct choice, dependent state changes, explained rejection, complete Undo, and inspector return through the shared components. Inspect desktop and actual 390 px browser layouts at 100% zoom, then record observed limitations. Screenshot appearance, type checking and unit tests are separate evidence; none establishes human recognition or 55-inch touch-table usability.

## Direct manipulation on the shared board

Legal destinations are actions at their actual map locations. Players tap or drag the same pawn; tapping it exposes facing handles at the piece. Board controls overlay the map. Audit and fixture controls belong in review tools, not player surfaces. The tabletop board fits without scrolling and has no assigned viewing edge. Phone hands show all four movement choices and use panning only when the map needs a closer view.
