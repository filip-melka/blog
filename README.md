# Filip's Blog

My personal blog, built around a simple idea: articles are plain MDX files, and anything interactive inside them is a small, self-contained React component developed in isolation.

## Philosophy

- **[Astro](https://astro.build) builds static pages from markdown articles.** Articles live in `src/articles/*.mdx` and compile to fully static HTML. React is only hydrated where an article actually embeds an interactive component (`client:visible`), so pages stay fast by default.
- **[Storybook](https://storybook.js.org) is the workshop for interactive components.** Every interactive widget in `src/articles/components/` (stack visualizers, expression evaluators, etc.) is a React + Tailwind component with a matching `.stories.tsx` file. Components are designed, built, and reviewed in Storybook before they're ever wired into an article.

## Writing workflow

The interesting part of this repo is how articles go from draft to published, with Claude Code doing the component work:

1. **Draft the article** in MDX. Wherever an interactive demo belongs, I leave a placeholder line like `-> interactive component (Stack Visualizer)`.
2. **Design the components in [Penpot](https://penpot.app).** Each placeholder gets a board in the Penpot design file. Build instructions — what the component does, how it animates, what it computes — go in Penpot comment threads anchored to the board, so the design file is the full spec.
3. **Let subagents build them.** A custom subagent, `blog-interactive-component-builder` (`.claude/agents/`), pulls the design from Penpot via the Penpot MCP: it exports the frames as images, reads exact colors/spacing/typography through the Penpot API, reads the comment threads as the behavior spec, and then implements the component in React + Tailwind along with its Storybook story.
4. **Wire everything together** with the `/wire-interactive-components` skill (`.claude/skills/`). It scans an article for placeholder lines, matches each one to its Penpot board, launches builder subagents in parallel, and replaces the placeholders with imports of the finished components.

A custom Claude Code hook (`.claude/settings.json`) keeps all of this consistent: after every file Claude edits or writes, a `PostToolUse` hook runs Prettier on that file, so generated components and articles are always formatted correctly.

## Custom remark plugins

Markdown processing is extended with two plugins in `src/plugins/remark/`:

- **`wrap-code-blocks`** — rewrites every fenced code block in an `.mdx` article into the interactive `<CodeBlock>` React component (injecting the import automatically), which adds copy-to-clipboard and opt-in collapsing via a `collapse` meta flag.
- **`reading-time`** — computes an estimated reading time for each article and exposes it to layouts via frontmatter.

Both are registered in `astro.config.mjs`, alongside `remark-math` + KaTeX for math and Shiki meta-highlighting for code.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site with `withastro/action` and publishes it to GitHub Pages.

## Bluesky automation

Once a deploy succeeds, `.github/workflows/bluesky-post.yml` runs `scripts/post-new-articles-to-bluesky.mjs`, which announces any article that doesn't yet have a matching post on the account's Bluesky feed — no local state is tracked; it just checks which article URLs are missing from the account's own recent posts. Each announcement is a link card (thumbnail + title + description pulled from frontmatter), built via `@atproto/api`.

- **`bluesky.config.json`** (repo root) sets the defaults: `defaultPostText` (the caption used when an article doesn't override it) and `hashtagsEnabled` (whether `categories` are turned into hashtags).
- **Per-article frontmatter overrides**, all optional:
  - `blueskyText` — custom caption for that article's post (an empty string posts the card with no caption at all).
  - `blueskyHashtags` — `true`/`false` to override the global `hashtagsEnabled` setting for just that article.
  - `categories` (required on every article) are converted to `#PascalCase` hashtags, e.g. `Computer Science` → `#ComputerScience`, and appended after the caption when hashtags are enabled.
- **Secrets**: the workflow needs `BLUESKY_IDENTIFIER` and `BLUESKY_APP_PASSWORD` (an [app password](https://bsky.app/settings/app-passwords), not the account password) set as repository secrets.
- **Local testing**: `BLUESKY_IDENTIFIER=... BLUESKY_APP_PASSWORD=... npm run bluesky:post -- --dry-run` logs what would be posted without actually posting. It can also be run on demand from the Actions tab (`workflow_dispatch`) instead of waiting for a deploy.

## Development

```sh
npm install
npm run dev        # Astro dev server
npm run storybook  # Storybook on :6006
npm run build      # static production build
```

Requires Node ≥ 22.12.

## Project layout

```
src/
├── articles/            # MDX articles
│   ├── banners/         # article banner images
│   └── components/      # interactive React components + Storybook stories
├── components/          # Astro site components (header, footer, …)
├── layouts/             # page layouts
├── pages/               # routes
├── plugins/remark/      # custom remark plugins
└── styles/              # global styles (Tailwind)
scripts/
└── post-new-articles-to-bluesky.mjs  # Bluesky auto-post script
.github/workflows/
├── deploy.yml           # build + deploy to GitHub Pages
└── bluesky-post.yml     # announce new articles on Bluesky after a deploy
bluesky.config.json      # Bluesky default post text + hashtag toggle
.claude/
├── agents/              # blog-interactive-component-builder subagent
├── skills/              # wire-interactive-components skill
└── settings.json        # hooks (Prettier on every edited file)
```
