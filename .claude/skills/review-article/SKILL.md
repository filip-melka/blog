---
name: review-article
user-invocable: true
description: Runs the editorial-review workflow (technical accuracy, clarity, code-sample correctness, each with skeptic verification) against a blog article and reports confirmed findings.
allowed-tools: Glob, AskUserQuestion, Workflow
---

# Review Article

Thin trigger for the `editorial-review` dynamic workflow (`.claude/workflows/editorial-review.js`). This skill does not review the article itself — it resolves the target path and dispatches to the workflow.

## Trigger

`/review-article <path-to-mdx>`

If no path is given, `Glob` for `src/articles/*.mdx` and ask the user which article to review via `AskUserQuestion`.

## Step 1 — Resolve the path

Accept either a bare filename (e.g. `foo.mdx`) or a path already rooted at `src/articles/`. Normalize to the repo-relative path (`src/articles/foo.mdx`) that the workflow expects. If the resolved file doesn't exist, say so and stop — don't guess a nearest match.

## Step 2 — Run the workflow

Call:

```
Workflow({ name: "editorial-review", args: "<resolved repo-relative path>" })
```

This runs in the background. Tell the user it's running and that results arrive as a task notification — don't block the conversation waiting on it.

## Step 3 — Report

When the workflow's result arrives, summarize the confirmed findings grouped by severity (high → medium → low), each with its location, issue, and suggested fix. Mention the raised-vs-confirmed count (`raisedCount` vs `confirmed.length`) so the user has a sense of how much the verify pass filtered out. If `confirmed` is empty, say so plainly rather than padding the report.
