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

## Custom remark plugins

Markdown processing is extended with two plugins in `src/plugins/remark/`:

- **`wrap-code-blocks`** — rewrites every fenced code block in an `.mdx` article into the interactive `<CodeBlock>` React component (injecting the import automatically), which adds copy-to-clipboard and opt-in collapsing via a `collapse` meta flag.
- **`reading-time`** — computes an estimated reading time for each article and exposes it to layouts via frontmatter.

Both are registered in `astro.config.mjs`, alongside `remark-math` + KaTeX for math and Shiki meta-highlighting for code.

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
.claude/
├── agents/              # blog-interactive-component-builder subagent
└── skills/              # wire-interactive-components skill
```
