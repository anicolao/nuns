# Project instructions

## Prompt discipline

Record every user prompt concerning this project verbatim in `PROMPTS.md`, including corrections and follow-up requests. Update the log before doing other project work for each new prompt.

Append each prompt exactly once, in conversation order, under the next sequential `## Prompt N` heading. An optional 2–4 word summary may appear in the heading, for example `## Prompt 7: Improve Card Layout`. Follow the heading with a blank line and the exact prompt body.

Preserve the user's spelling, typos, punctuation, capitalization, whitespace and line breaks. Do not paraphrase, correct, summarize, or otherwise edit the prompt body. Do not include assistant messages, tool output, or automatically supplied environment context.

`PROMPTS.md` is append-only: never rewrite, reorder, renumber, or remove existing entries or headings. Never invent or duplicate prompts for continuation work. Backfill earlier prompts only from their actual verbatim text available in the conversation; do not reconstruct missing text from summaries. Include new prompt entries with their related work when committing.

## Interaction and animation parity

The animation lab must use the production Svelte components, action handlers and animation presenter. Never create lab-specific mockups, fake components, screenshot substitutes, or duplicate rendering/interaction implementations. Keep `/play/` and the lab on the same shared component path. Scenarios may seed explicit state; identify presentation-adapter and networking limitations honestly. Integrate approved components into the eventual game instead of reimplementing them. Review phone portrait and landscape, tablet, laptop and all tabletop acting edges, including reduced motion.

Player-facing surfaces must prefer direct manipulation: put legal movement and facing controls on the board, make pieces themselves actionable, and keep audit controls and implementation language in the gallery/lab shell. The tabletop game must fit its viewport without page or board scrolling. Reviewer viewpoint simulation belongs outside the production play surface; players are not assigned a viewing edge.
