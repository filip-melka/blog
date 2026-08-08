// Pure MDX -> Dev.to conversion. No filesystem, no network, no process exit:
// hand it a source string, get back a Dev.to article payload plus warnings.
// Kept separate from the CLI so the whole conversion can be exercised offline
// with no Dev.to account (npm run devto:post -- --dry-run).
import matter from 'gray-matter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

export const SITE_URL = 'https://filipmelka.com'
export const GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/filip-melka/blog/main/src/articles/'

const INTERACTIVE = 'Interactive'
const KNOWN_INTERACTIVE_ATTRS = new Set(['fallback', 'fallbackText', 'caption'])
const MAX_DESCRIPTION = 350
const DEFAULT_MAX_TAGS = 4

// Two processors on purpose. Parsing needs remark-mdx (JSX/ESM) and remark-math
// ($...$). Stringifying must have neither: mdast-util-mdx adds "{" to the
// unsafe-character list and mdast-util-math adds "$", so a literal brace or
// dollar in prose would come out as "\{" / "\$". By the time we stringify,
// every mdx and math node has already been replaced.
const parser = unified()
  .use(remarkParse)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkMath)

const stringifier = unified()
  .use(remarkStringify, {
    bullet: '-', // articles always use "-" for bullets
    emphasis: '_', // articles always use "_x_" for italics
    strong: '*',
    fences: true,
    listItemIndent: 'one',
  })
  .use(remarkGfm) // tables

export class ConversionError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ConversionError'
  }
}

function at(node) {
  const start = node.position?.start
  return start ? `line ${start.line}` : 'unknown line'
}

// gray-matter hands us the body with the frontmatter removed, so every mdast
// position is short by the height of that block and error messages would point
// at the wrong line. Shifting the tree once here beats threading an offset
// through every transform.
function shiftPositions(tree, offset) {
  if (offset === 0) return
  visit(tree, (node) => {
    if (node.position?.start) node.position.start.line += offset
    if (node.position?.end) node.position.end.line += offset
  })
}

// --- transforms ---------------------------------------------------------

// `import { X } from './components/x'` carries no content, and the components
// it names are handled (or rejected) by the <Interactive> pass below.
function removeEsmImports(tree) {
  visit(tree, 'mdxjsEsm', (node, index, parent) => {
    if (parent == null || index == null) return
    parent.children.splice(index, 1)
    return index
  })
}

function readInteractiveAttributes(node, slug) {
  const attrs = {}
  for (const attr of node.attributes ?? []) {
    if (attr.type !== 'mdxJsxAttribute') {
      throw new ConversionError(
        `${slug}.mdx (${at(node)}): <Interactive> uses a spread attribute, ` +
          `which the exporter can't read. Write the props out literally.`,
      )
    }
    if (!KNOWN_INTERACTIVE_ATTRS.has(attr.name)) {
      throw new ConversionError(
        `${slug}.mdx (${at(node)}): <Interactive> has an unknown prop ` +
          `"${attr.name}". Valid props: fallback, fallbackText, caption.`,
      )
    }
    if (typeof attr.value !== 'string') {
      throw new ConversionError(
        `${slug}.mdx (${at(node)}): <Interactive> prop "${attr.name}" must be ` +
          `a plain string literal, not an expression or a bare flag.`,
      )
    }
    attrs[attr.name] = attr.value
  }
  return attrs
}

// The caption sits under whichever fallback is substituted. It is parsed as
// markdown (it may contain $...$) and wrapped in emphasis so it reads as a
// figure caption. Only used under fallbackText - an image fallback's caption
// goes through buildImageReplacement instead, since Dev.to only supports an
// image caption via raw HTML <figcaption>, not a markdown convention.
function buildCaption(caption, node, slug) {
  const parsed = parser.parse(caption)
  if (parsed.children.length !== 1 || parsed.children[0].type !== 'paragraph') {
    throw new ConversionError(
      `${slug}.mdx (${at(node)}): <Interactive caption> must be a single ` +
        `paragraph of inline markdown.`,
    )
  }
  return {
    type: 'paragraph',
    children: [{ type: 'emphasis', children: parsed.children[0].children }],
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// figcaption content is raw HTML, not markdown, so only a deliberately narrow
// set of inline content is allowed through: plain text and $...$ math
// (rendered as the same katex liquid tag body math uses - unconfirmed whether
// Forem expands Liquid inside a raw HTML block, same open question as katex
// inside a {% katex %} block). Anything richer (bold, links, ...) would need
// its own HTML tag and silently wouldn't get one, so it's rejected rather than
// emitted wrong.
function serializeCaptionHtml(caption, node, slug, stats) {
  const parsed = parser.parse(caption)
  if (parsed.children.length !== 1 || parsed.children[0].type !== 'paragraph') {
    throw new ConversionError(
      `${slug}.mdx (${at(node)}): <Interactive caption> must be a single ` +
        `paragraph of inline markdown.`,
    )
  }
  return parsed.children[0].children
    .map((child) => {
      if (child.type === 'text') return escapeHtml(child.value)
      if (child.type === 'inlineMath') {
        stats.katexInline += 1
        return `{% katex inline %}${child.value.trim()}{% endkatex %}`
      }
      throw new ConversionError(
        `${slug}.mdx (${at(node)}): <Interactive caption> on an image ` +
          `fallback only supports plain text and $...$ math (found a ` +
          `"${child.type}"). It becomes a raw HTML <figcaption>, not ` +
          `markdown, so richer formatting has nowhere to go - simplify the ` +
          `caption.`,
      )
    })
    .join('')
}

// An image fallback with no caption stays a plain markdown image - nothing to
// caption, no reason to reach for HTML. With a caption, Dev.to's documented
// way to render one is a raw HTML <figure>/<figcaption> (there is no markdown
// convention for it), so the whole thing becomes one opaque `html` node.
function buildImageReplacement(attrs, node, slug, resolveUrl, stats) {
  const url = resolveUrl(attrs.fallback, `<Interactive> at ${at(node)}`)
  if (!attrs.caption) {
    return {
      type: 'paragraph',
      children: [{ type: 'image', url, alt: '', title: null }],
    }
  }
  const figcaption = serializeCaptionHtml(attrs.caption, node, slug, stats)
  return {
    type: 'html',
    value:
      `<figure>\n  <img src="${escapeHtml(url)}" alt="${escapeHtml(attrs.caption)}">\n` +
      `  <figcaption>${figcaption}</figcaption>\n</figure>`,
  }
}

// Replaces each <Interactive> (and its React children) with its export
// fallback. Runs BEFORE the math pass so that $...$ inside fallbackText and
// caption goes through exactly the same math -> liquid conversion as body math.
function expandInteractive(tree, slug, resolveUrl, stats) {
  visit(tree, (node, index, parent) => {
    if (parent == null || index == null) return

    // An inline <Interactive> can't work: every substitution it produces
    // (image/figure, parsed markdown, caption) is block-level.
    if (node.type === 'mdxJsxTextElement' && node.name === INTERACTIVE) {
      throw new ConversionError(
        `${slug}.mdx (${at(node)}): <Interactive> is being used inline. It ` +
          `must sit on its own line as a block element.`,
      )
    }
    if (node.type !== 'mdxJsxFlowElement' || node.name !== INTERACTIVE) return

    const attrs = readInteractiveAttributes(node, slug)
    if (!attrs.fallback && !attrs.fallbackText) {
      throw new ConversionError(
        `${slug}.mdx (${at(node)}): <Interactive> has neither "fallback" nor ` +
          `"fallbackText", so there is nothing to publish in its place.`,
      )
    }

    const replacement = attrs.fallbackText
      ? parser.parse(attrs.fallbackText).children
      : [buildImageReplacement(attrs, node, slug, resolveUrl, stats)]

    if (attrs.fallbackText && attrs.caption) {
      replacement.push(buildCaption(attrs.caption, node, slug))
    }

    parent.children.splice(index, 1, ...replacement)
    // Skip past what we just injected: it can't contain another <Interactive>.
    return index + replacement.length
  })
}

// Anything JSX-shaped still standing after expandInteractive() was never
// wrapped, so it would vanish from the Dev.to version without a trace. That is
// a content bug, not something to paper over - refuse to publish and name it.
function assertNoUnwrappedJsx(tree, slug) {
  const offenders = []
  visit(tree, (node) => {
    if (
      node.type === 'mdxJsxFlowElement' ||
      node.type === 'mdxJsxTextElement'
    ) {
      offenders.push(`<${node.name ?? 'fragment'}> at ${at(node)}`)
    } else if (
      node.type === 'mdxFlowExpression' ||
      node.type === 'mdxTextExpression'
    ) {
      offenders.push(`{...} expression at ${at(node)}`)
    }
  })
  if (offenders.length === 0) return
  throw new ConversionError(
    `${slug}.mdx: ${offenders.length} component(s) are not wrapped in ` +
      `<Interactive>, so they would silently disappear from the Dev.to ` +
      `version:\n` +
      offenders.map((offender) => `    - ${offender}`).join('\n') +
      `\n  Wrap each in <Interactive fallback="/path.png"> or ` +
      `<Interactive fallbackText="...">.`,
  )
}

// Block math bodies in these articles are indented with a literal tab
// ("$$\n\tx=0.999\\dots\n$$"), which remark-math keeps in node.value. Strip the
// common indent so KaTeX gets a clean expression.
function dedent(value) {
  const lines = value.split('\n')
  const indents = lines
    .filter((line) => line.trim() !== '')
    .map((line) => line.match(/^[\t ]*/)[0].length)
  const common = indents.length > 0 ? Math.min(...indents) : 0
  return lines
    .map((line) => line.slice(common))
    .join('\n')
    .replace(/^\n+|\s+$/g, '')
}

// mdast `html` nodes are the right carrier: mdast-util-to-markdown emits
// node.value verbatim with no escaping, and `html` is valid as both flow
// content and phrasing content, so the same node type covers $$...$$ (its own
// block) and $...$ (mid-sentence).
function mathToLiquid(tree, stats) {
  visit(tree, (node, index, parent) => {
    if (parent == null || index == null) return
    if (node.type === 'math') {
      stats.katexBlock += 1
      parent.children[index] = {
        type: 'html',
        value: `{% katex %}\n${dedent(node.value)}\n{% endkatex %}`,
      }
      return index + 1
    }
    if (node.type === 'inlineMath') {
      stats.katexInline += 1
      parent.children[index] = {
        type: 'html',
        value: `{% katex inline %}${node.value.trim()}{% endkatex %}`,
      }
      return index + 1
    }
  })
}

// "```go {3}" / "```go collapse" - the meta string drives this site's Shiki
// transformer and the CodeBlock wrapper. Dev.to would print it as part of the
// language name.
function stripCodeMeta(tree) {
  visit(tree, 'code', (node) => {
    node.meta = null
  })
}

// Every local path is also recorded into `localAssets` so the CLI can check the
// file actually exists. Nothing else would catch a dangling one: <Interactive>
// renders no <img>, so the Astro build is happy, and this module never touches
// the filesystem - the first symptom would be a broken image on a live post.
function makeUrlResolver({ slug, githubRawBase, siteUrl, localAssets }) {
  return function resolveUrl(url, where) {
    if (url.startsWith('#') || url.startsWith('mailto:')) return url
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) return url
    // ./images/x.png, ./banners/x.png and ./fallbacks/x.png live next to the
    // article in the repo
    if (url.startsWith('./')) {
      const resolved = githubRawBase + url.slice(2)
      localAssets.push({
        repoPath: `src/articles/${url.slice(2)}`,
        url: resolved,
        where,
      })
      return resolved
    }
    // /x.png is a public/ asset served from the deployed site
    if (url.startsWith('/')) {
      const resolved = siteUrl + url
      localAssets.push({ repoPath: `public${url}`, url: resolved, where })
      return resolved
    }
    throw new ConversionError(
      `${slug}.mdx: ${where} has the relative path "${url}", which can't be ` +
        `turned into a public URL. Use "./images/...", "./banners/...", ` +
        `"./fallbacks/...", a site-absolute "/..." path under public/, or a ` +
        `full https:// URL.`,
    )
  }
}

function rewriteUrls(tree, resolveUrl) {
  visit(tree, 'image', (node) => {
    node.url = resolveUrl(node.url, `image "${node.alt ?? ''}"`)
  })
  visit(tree, 'link', (node) => {
    node.url = resolveUrl(node.url, `link to "${node.url}"`)
  })
}

// --- tags ---------------------------------------------------------------

// Dev.to tags are lowercase alphanumeric with no separators, max 4 per article.
// "GitHub Pages" -> "githubpages". tagMap overrides the mechanical result where
// Dev.to's community tag differs ("Web Development" -> "webdev").
export function categoriesToTags(categories, config, warn) {
  const tagMap = config.tagMap ?? {}
  const maxTags = config.maxTags ?? DEFAULT_MAX_TAGS
  const seen = new Set()
  const tags = []

  for (const category of categories ?? []) {
    const tag = (tagMap[category] ?? category)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
    if (tag === '') {
      warn(`category "${category}" normalises to an empty tag; skipped.`)
      continue
    }
    if (seen.has(tag)) continue
    seen.add(tag)
    tags.push({ tag, category })
  }

  if (tags.length > maxTags) {
    const dropped = tags
      .slice(maxTags)
      .map((entry) => `"${entry.category}"`)
      .join(', ')
    warn(`Dev.to allows ${maxTags} tags; dropping ${dropped}.`)
  }
  return tags.slice(0, maxTags).map((entry) => entry.tag)
}

// --- entry point --------------------------------------------------------

export function convertArticle({ source, slug, config = {} }) {
  const warnings = []
  const warn = (message) => warnings.push(message)
  const stats = { katexInline: 0, katexBlock: 0 }

  const githubRawBase = config.githubRawBase ?? GITHUB_RAW_BASE
  const siteUrl = config.siteUrl ?? SITE_URL
  const { data: frontmatter, content } = matter(source)

  for (const key of ['title', 'description', 'banner']) {
    if (typeof frontmatter[key] !== 'string' || frontmatter[key] === '') {
      throw new ConversionError(`${slug}.mdx: frontmatter "${key}" is missing.`)
    }
  }

  const localAssets = []
  const resolveUrl = makeUrlResolver({
    slug,
    githubRawBase,
    siteUrl,
    localAssets,
  })
  const tree = parser.parse(content)
  shiftPositions(
    tree,
    source.slice(0, source.length - content.length).split('\n').length - 1,
  )

  removeEsmImports(tree)
  expandInteractive(tree, slug, resolveUrl, stats)
  assertNoUnwrappedJsx(tree, slug)
  mathToLiquid(tree, stats)
  stripCodeMeta(tree)
  rewriteUrls(tree, resolveUrl)

  let description = frontmatter.description
  if (description.length > MAX_DESCRIPTION) {
    warn(
      `description is ${description.length} chars; truncated to ${MAX_DESCRIPTION}.`,
    )
    description = `${description.slice(0, MAX_DESCRIPTION - 1)}…`
  }

  const tags = categoriesToTags(frontmatter.categories, config, warn)
  if (tags.length === 0) warn('no usable Dev.to tags from "categories".')

  const canonicalUrl = `${siteUrl}/blog/${slug}/`

  return {
    slug,
    canonicalUrl,
    warnings,
    stats,
    localAssets,
    article: {
      title: frontmatter.title,
      body_markdown: stringifier.stringify(tree),
      // Always a draft. The script's job ends when the article lands in the
      // Dev.to drafts; reviewing and publishing are manual steps in Dev.to's
      // own UI, so nothing here ever decides that an article should go live.
      published: false,
      main_image: resolveUrl(frontmatter.banner, 'frontmatter "banner"'),
      canonical_url: canonicalUrl,
      description,
      tags: tags.join(','),
      ...(config.organizationId
        ? { organization_id: config.organizationId }
        : {}),
    },
  }
}
