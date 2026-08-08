---
name: wire-interactive-components
user-invocable: true
description: Given a blog article MDX file with interactive-component placeholders and a ready Penpot design, match each placeholder to its design, build the components in parallel subagents, then wire the finished components into the article wrapped in <Interactive> export metadata.
allowed-tools: Read, Edit, Grep, Glob, Agent, AskUserQuestion, Bash, mcp__claude_ai_penpot__high_level_overview, mcp__claude_ai_penpot__execute_code, mcp__claude_ai_penpot__export_shape, mcp__claude_ai_penpot__penpot_api_info
---

# Wire Interactive Components

Turns an article's `-> ...` placeholder lines into working interactive components, using an already-prepared Penpot design as the source of truth. This orchestrates the `blog-interactive-component-builder` agent — it does not implement components itself.

Every component it wires is wrapped in `<Interactive>`, which carries the metadata the Dev.to exporter substitutes for the React widget. Wrapping is not optional: `npm run devto:post` treats an unwrapped component as a hard error, because a widget it can't render as markdown would otherwise vanish from the republished version without a trace.

## Trigger

`/wire-interactive-components <path-to-mdx>`

If no path is given, ask which article under `src/articles/*.mdx` to process.

## Step 1 — Find the placeholders

Read the target `.mdx` file. A placeholder is a line whose entire content (after trimming) starts with `-> interactive component` or `-> static component`, e.g. `-> interactive component` or `-> interactive component (Stack Visualizer)`. Ignore any other `->` line (e.g. `-> examples`, `-> image`) — those are placeholders for something else and out of scope for this skill. Also ignore any `->` that appears inside a fenced code block (` ``` `) or inside inline code — those are arrow functions, not placeholders.

For each placeholder, record:

- Its exact line text and line number (needed later to locate and replace it verbatim).
- Local context: the nearest preceding heading, and the paragraph(s) immediately before/after it. This is what you'll use to infer what the component should demonstrate when the placeholder doesn't name it explicitly.
- Any explicit name hint in parentheses, if present (e.g. `(Stack Visualizer)`).

If there are no placeholder lines, tell the user and stop — nothing to wire.

## Step 2 — Match each placeholder to a Penpot board

1. Call `high_level_overview` (Penpot MCP) once if you haven't already this conversation.
2. Find the Penpot page for this article (Penpot files are typically organized with one page per article, named after the article's title/slug), then enumerate its boards via `execute_code`.
3. For boards you're unsure are already spoken for, check which components already exist under `src/articles/components/*.tsx` and are already imported/used elsewhere in this same article — exclude those boards from matching, since they're already built and wired. (An already-wired component is wrapped in `<Interactive>`; the wrapper is not itself an article component and never corresponds to a board.)
4. Match remaining placeholders to remaining boards, in this priority order:
   - **Explicit hint**: the placeholder's parenthesized name matches a board name directly.
   - **Comment threads**: fetch each candidate board's comment threads (same technique the `blog-interactive-component-builder` agent uses — `penpot.currentPage.findCommentThreads()` then `thread.findComments()` per thread) and check whether a thread references the placeholder's surrounding section/heading.
   - **Thematic match**: the board's name/content clearly corresponds to the concept in the placeholder's surrounding prose (e.g. a board demonstrating postfix evaluation next to a paragraph introducing postfix evaluation).
   - **Positional fallback**: only if there's exactly one remaining unmatched placeholder and exactly one remaining unmatched board left after the above, and their order on the page/in the article agrees, pair them.
5. If two or more boards are plausible for the same placeholder, use `AskUserQuestion` to disambiguate — don't guess.
6. If no board can be matched to a placeholder with reasonable confidence, **skip it** — leave that placeholder line untouched and note it in the final report as "no matching design found."

Produce a mapping table (placeholder → board) before moving on, and show it briefly so the user can see what you're about to build.

## Step 3 — Build components in parallel

For each matched (placeholder, board) pair, spawn one `Agent` call with `subagent_type: "blog-interactive-component-builder"`. Launch all of them **in a single message** (multiple tool calls) so they run in parallel — they don't touch each other's files or the article, so there's no conflict.

Each subagent's prompt must be self-contained (it starts with no memory of this conversation) and should include:

- The absolute path to the target article.
- The exact Penpot board name (and page, if the file has multiple pages) to build — you've already disambiguated this, so the subagent shouldn't have to search.
- The placeholder's surrounding context (heading + nearby prose) so it can infer sensible default props.
- An explicit reminder that it must not edit the article `.mdx` file — it already knows this from its own instructions, but state it anyway since correctness here matters.
- A request to end its report with one extra line: a single plain-text sentence describing what the finished component shows, including any concrete values it displays. The builder has just read the design and written the code, so it's the best-informed party; Step 5 uses this to choose an export fallback, and may override it.

## Step 4 — Collect wiring info once everything finishes

Wait for all subagents to complete. Each one ends its report with a structured wiring summary: component name, import path, target article, target placeholder (quoted), and suggested JSX usage. Collect all of these before touching the article — do not edit the file after each subagent individually.

## Step 5 — Choose an export fallback for each component

Dev.to can't run React, so `<Interactive>` carries what the exporter should print in the widget's place. Decide this now, while the design and the builder's description are still fresh — it is much harder to reconstruct later.

Pick exactly one of two kinds per component instance:

- **`fallbackText`** — markdown (LaTeX allowed), substituted for the widget. **Prefer this whenever the widget's content is expressible as a sentence or a bit of math.** A `ComparisonReveal left="3" right="5" sign="<"` becomes `fallbackText="$3 < 5$"`. There's no asset to create, and nothing to keep in sync if the component changes.
- **`fallback`** — a path to a PNG, substituted as an image. Use this **only** when the widget is genuinely visual: a diagram, a spatial layout, something animated. A component whose whole point is a picture can't be flattened into a sentence.

Fallbacks are **per instance, not per component**. The same component used four times with different props needs four fallbacks.

### Where fallback images live

`src/articles/fallbacks/`, referenced from the article as `./fallbacks/<name>.png` — beside the existing `banners/` and `images/`, which the exporter rewrites to GitHub raw URLs the same way. These are export-only assets and must **not** go in `public/`, since the site never displays them.

Name the file after **what the widget shows**, not after the component file — `zeno-paradox.png`, not `zeno-paradox-widget.png`. "Widget", "explainer", "demo" and the like are implementation details of the React component and mean nothing about a PNG. When one component appears more than once, add a short discriminator: `./fallbacks/comparison-0999-vs-1.png`.

**You do not create these PNGs.** Wire the path, then list it in the Step 7 report as still needed — Filip screenshots them. A dangling path is caught by `npm run devto:post -- --dry-run`, which fails the article rather than publishing a broken image, so this is safe to leave pending.

### `caption`

Optional, and rendered as emphasised text under whichever fallback was substituted. This is the natural home for a "try the interactive version on the original post" nudge. Add one when the fallback is a static stand-in for something the reader would want to play with.

With an image fallback the caption doubles as the image's alt text, and omitting it ships an empty `alt=""` — so treat a caption as effectively required whenever you use `fallback`.

### Constraints

Each of these is a hard error at export time (`scripts/lib/mdx-to-devto.mjs`), and none is discoverable by looking at the article:

- Props must be **plain string literals**. No `{expression}`, no spread, no bare flags — remark reads the MDX source, and can't evaluate anything.
- The only valid props are `fallback`, `fallbackText`, `caption`. Anything else throws.
- At least one of `fallback` / `fallbackText` is required. This one also fails the Astro build, via `src/components/Interactive.astro`.
- LaTeX uses **single** backslashes: `fallbackText="$0.999\dots = 1$"`. JSX attributes don't process escapes, so `\\dots` would reach Dev.to literally.
- `<Interactive>` must be block-level, on its own line. Inline usage throws.
- `caption` must be a single paragraph of inline markdown.

## Step 6 — Apply all edits to the article in one pass

Only after every subagent has reported back:

1. **Imports**: insert `import { ComponentName } from '<import path>'` for each successfully built component into the existing import block right after the frontmatter's closing `---`, matching the file's exact style (single quotes, no semicolons, one import per line). Skip any import that's already present. Order new import lines to match the top-to-bottom order of their placeholders in the article.
2. **The wrapper import**: add `import Interactive from '../components/Interactive.astro'` as the first line of the import block, unless it's already there. Note this is a **default** import with no braces — every other import in these files is a named one, so copying the surrounding style gives you a broken `import { Interactive }`.
3. **Placeholder replacement**: replace each placeholder's exact line with the subagent's reported "Suggested JSX usage" line, wrapped in the `<Interactive>` element you designed in Step 5:

   ```mdx
   <Interactive fallbackText="$3 < 5$">
     <ComparisonReveal client:visible left="3" right="5" sign="<" />
   </Interactive>
   ```

   Keep the blank lines that surrounded the placeholder. Locate the line by the verbatim quote the subagent reported; if it no longer matches the current file content (e.g. the file changed mid-run), search for the nearest remaining `->` line with matching hint text instead of guessing — if you still can't find a confident match, leave it and flag it in the final report instead of editing the wrong line.

4. Do not touch placeholders that were skipped in Step 2 (no matching design) or that a subagent failed to complete.

Do not run Prettier on the `.mdx` file — there's no MDX parser configured in this repo's `.prettierrc`, and running it risks mangling the JSX/frontmatter. Match the existing file's formatting by hand instead.

## Step 7 — Report

Summarize, per placeholder: built (with component name) / skipped (no matching design) / failed (with reason). For each one built, state which fallback kind it got and its text or path.

Then list every PNG that still needs to be created, with its exact path, under a heading that can't be missed:

```
PNG still needed:
  src/articles/fallbacks/zeno-paradox.png
```

Suggest two verification steps: starting the dev server (`astro dev --background`, per this repo's `CLAUDE.md`) or Storybook to eyeball the new components in both light and dark mode, and `npm run devto:post -- --dry-run --only=<slug>` to confirm the wiring actually exports — that command fails until the listed PNGs exist, which is what keeps a broken image off Dev.to.

## What not to do

- Don't build a component yourself in the main thread — always dispatch to the `blog-interactive-component-builder` agent, even for a single placeholder.
- Don't edit the article until all subagents have finished (Step 4/6) — editing mid-dispatch risks a subagent's stale read of the file producing a wiring report that no longer lines up.
- Don't wire a bare component. Every component you write into the article gets an `<Interactive>` wrapper — an unwrapped one breaks `npm run devto:post` for the whole article.
- Don't wire a `fallback` path without listing it in the Step 7 report as still needed. It's a path to a file that doesn't exist yet, and nothing about the article's appearance will reveal that.
- Don't create the fallback PNGs yourself, and don't substitute an unrelated existing image to make a path resolve.
- Don't invent a board match when the signal is genuinely ambiguous or absent — skip the placeholder or ask, per Step 2.
- Don't re-build a component whose board is already implemented and wired elsewhere in the article.
