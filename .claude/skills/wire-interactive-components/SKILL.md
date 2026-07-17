---
name: wire-interactive-components
user-invocable: true
description: Given a blog article MDX file with interactive-component placeholders and a ready Penpot design, match each placeholder to its design, build the components in parallel subagents, then wire the finished components into the article.
allowed-tools: Read, Edit, Grep, Glob, Agent, AskUserQuestion, Bash, mcp__claude_ai_penpot__high_level_overview, mcp__claude_ai_penpot__execute_code, mcp__claude_ai_penpot__export_shape, mcp__claude_ai_penpot__penpot_api_info
---

# Wire Interactive Components

Turns an article's `-> ...` placeholder lines into working interactive components, using an already-prepared Penpot design as the source of truth. This orchestrates the `blog-interactive-component-builder` agent — it does not implement components itself.

## Trigger
`/wire-interactive-components <path-to-mdx>`

If no path is given, ask which article under `src/articles/*.mdx` to process.

## Step 1 — Find the placeholders

Read the target `.mdx` file. A placeholder is a line whose entire content (after trimming) starts with `->`, e.g. `-> examples` or `-> interactive demo (Stack Visualizer)`. Ignore any `->` that appears inside a fenced code block (` ``` `) or inside inline code — those are arrow functions, not placeholders.

For each placeholder, record:
- Its exact line text and line number (needed later to locate and replace it verbatim).
- Local context: the nearest preceding heading, and the paragraph(s) immediately before/after it. This is what you'll use to infer what the component should demonstrate when the placeholder doesn't name it explicitly.
- Any explicit name hint in parentheses, if present (e.g. `(Stack Visualizer)`).

If there are no placeholder lines, tell the user and stop — nothing to wire.

## Step 2 — Match each placeholder to a Penpot board

1. Call `high_level_overview` (Penpot MCP) once if you haven't already this conversation.
2. Find the Penpot page for this article (Penpot files are typically organized with one page per article, named after the article's title/slug), then enumerate its boards via `execute_code`.
3. For boards you're unsure are already spoken for, check which components already exist under `src/articles/components/*.tsx` and are already imported/used elsewhere in this same article — exclude those boards from matching, since they're already built and wired.
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

## Step 4 — Collect wiring info once everything finishes

Wait for all subagents to complete. Each one ends its report with a structured wiring summary: component name, import path, target article, target placeholder (quoted), and suggested JSX usage. Collect all of these before touching the article — do not edit the file after each subagent individually.

## Step 5 — Apply all edits to the article in one pass

Only after every subagent has reported back:

1. **Imports**: insert `import { ComponentName } from '<import path>'` for each successfully built component into the existing import block right after the frontmatter's closing `---`, matching the file's exact style (single quotes, no semicolons, one import per line). Skip any import that's already present. Order new import lines to match the top-to-bottom order of their placeholders in the article.
2. **Placeholder replacement**: replace each placeholder's exact line with its reported "Suggested JSX usage" line. Locate the line by the verbatim quote the subagent reported; if it no longer matches the current file content (e.g. the file changed mid-run), search for the nearest remaining `->` line with matching hint text instead of guessing — if you still can't find a confident match, leave it and flag it in the final report instead of editing the wrong line.
3. Do not touch placeholders that were skipped in Step 2 (no matching design) or that a subagent failed to complete.

Do not run Prettier on the `.mdx` file — there's no MDX parser configured in this repo's `.prettierrc`, and running it risks mangling the JSX/frontmatter. Match the existing file's formatting by hand instead.

## Step 6 — Report

Summarize, per placeholder: built (with component name) / skipped (no matching design) / failed (with reason). Remind the user that visual verification wasn't done automatically — suggest starting the dev server (`astro dev --background`, per this repo's `CLAUDE.md`) or Storybook to eyeball the new components in place, in both light and dark mode.

## What not to do

- Don't build a component yourself in the main thread — always dispatch to the `blog-interactive-component-builder` agent, even for a single placeholder.
- Don't edit the article until all subagents have finished (Step 4/5) — editing mid-dispatch risks a subagent's stale read of the file producing a wiring report that no longer lines up.
- Don't invent a board match when the signal is genuinely ambiguous or absent — skip the placeholder or ask, per Step 2.
- Don't re-build a component whose board is already implemented and wired elsewhere in the article.
