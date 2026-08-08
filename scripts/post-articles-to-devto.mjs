#!/usr/bin/env node
// Sends articles from src/articles to Dev.to as drafts, once each.
//
// An article that already exists on Dev.to - draft or live - is never touched
// again: review and publishing happen by hand in Dev.to's UI, and re-sending
// would either clobber an in-progress edit or un-publish a live post. So there
// is no update path, and "already there" is the expected outcome of most runs.
// Existence is decided by canonical_url against the account's own articles, so
// no state is tracked in the repo.
//
// Unwrapped interactive components are a hard error - a widget that can't be
// rendered as markdown must not silently vanish from the Dev.to version.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createArticle,
  fetchMyCanonicalUrls,
  normalizeUrl,
  sleep,
} from './lib/devto-api.mjs'
import { convertArticle } from './lib/mdx-to-devto.mjs'

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const ARTICLES_DIR = path.join(REPO_ROOT, 'src/articles')
const PREVIEW_DIR = path.join(REPO_ROOT, '.devto-preview')
// Forem throttles article writes; a short gap keeps a full back-catalogue run
// from tripping the limit in the first place.
const WRITE_DELAY_MS = 2000

const config = JSON.parse(
  readFileSync(path.join(REPO_ROOT, 'devto.config.json'), 'utf8'),
)

const isDryRun = process.argv.includes('--dry-run')
const onlySlug = process.argv
  .find((arg) => arg.startsWith('--only='))
  ?.slice('--only='.length)

// config.skip is applied here rather than in the publish loop, so an article
// that will never be republished can't fail the run by containing an unwrapped
// component - it is dropped before conversion ever sees it.
function readArticles() {
  const skip = new Set(config.skip ?? [])
  const files = readdirSync(ARTICLES_DIR)
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
    .map((name) => ({ name, slug: path.basename(name, path.extname(name)) }))
    .filter((file) => !onlySlug || file.slug === onlySlug)
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const skipped = files.filter((file) => skip.has(file.slug))
  if (skipped.length > 0) {
    console.log(
      `Skipping ${skipped.length} article(s) per devto.config.json: ` +
        skipped.map((file) => file.slug).join(', '),
    )
  }

  return files
    .filter((file) => !skip.has(file.slug))
    .map((file) => ({
      slug: file.slug,
      source: readFileSync(path.join(ARTICLES_DIR, file.name), 'utf8'),
    }))
}

// The converter turns "./fallbacks/x.png" into a public URL without ever
// looking at the disk, so a path pointing at a file that doesn't exist yet
// converts cleanly and only shows up as a broken image on the live post. This
// is the one place that can catch it, and it runs during --dry-run too.
function assertLocalAssetsExist(result) {
  const missing = result.localAssets.filter(
    (asset) => !existsSync(path.join(REPO_ROOT, asset.repoPath)),
  )
  if (missing.length === 0) return
  throw new Error(
    `${missing.length} referenced file(s) don't exist:\n` +
      missing
        .map((asset) => `    - ${asset.repoPath} (${asset.where})`)
        .join('\n'),
  )
}

function writePreview(converted) {
  mkdirSync(PREVIEW_DIR, { recursive: true })
  writeFileSync(
    path.join(PREVIEW_DIR, `${converted.slug}.md`),
    converted.article.body_markdown,
  )
  const { body_markdown: _body, ...meta } = converted.article
  writeFileSync(
    path.join(PREVIEW_DIR, `${converted.slug}.json`),
    `${JSON.stringify(meta, null, 2)}\n`,
  )
}

async function main() {
  const files = readArticles()
  if (files.length === 0) {
    console.log('No articles found.')
    return
  }

  let hadFailure = false
  const converted = []

  for (const file of files) {
    try {
      const result = convertArticle({
        source: file.source,
        slug: file.slug,
        config,
      })
      for (const warning of result.warnings) {
        console.warn(`Warning for "${file.slug}": ${warning}`)
      }
      assertLocalAssetsExist(result)
      converted.push(result)
    } catch (error) {
      hadFailure = true
      console.error(`Failed to convert "${file.slug}":\n  ${error.message}`)
    }
  }

  if (isDryRun) {
    for (const result of converted) {
      writePreview(result)
      const { katexInline, katexBlock } = result.stats
      console.log(
        `[dry-run] ${result.slug}\n` +
          `  title:      ${result.article.title}\n` +
          `  tags:       ${result.article.tags}\n` +
          `  published:  ${result.article.published}\n` +
          `  canonical:  ${result.article.canonical_url}\n` +
          `  main_image: ${result.article.main_image}\n` +
          `  katex:      ${katexInline} inline, ${katexBlock} block\n` +
          `  body:       ${result.article.body_markdown.length} chars -> ` +
          `${path.relative(REPO_ROOT, PREVIEW_DIR)}/${result.slug}.md`,
      )
    }
    console.log(
      `[dry-run] Converted ${converted.length}/${files.length} article(s). ` +
        `No network calls were made.`,
    )
    if (hadFailure) process.exitCode = 1
    return
  }

  const apiKey = process.env.DEVTO_API_KEY
  if (!apiKey) {
    console.error('DEVTO_API_KEY is not set.')
    process.exitCode = 1
    return
  }

  const existing = await fetchMyCanonicalUrls(apiKey)
  console.log(`Found ${existing.size} existing Dev.to article(s).`)

  let created = 0
  let alreadyThere = 0
  for (const { slug, article, canonicalUrl } of converted) {
    try {
      if (existing.has(normalizeUrl(canonicalUrl))) {
        alreadyThere++
        console.log(`Skipped "${slug}": already on Dev.to.`)
        continue
      }

      if (created > 0) await sleep(WRITE_DELAY_MS)
      const result = await createArticle(apiKey, article)
      created++
      console.log(`Created draft "${slug}" on Dev.to: ${result.url}`)
    } catch (error) {
      hadFailure = true
      console.error(`Failed to publish "${slug}":`, error)
    }
  }

  console.log(
    `Created ${created} draft(s), skipped ${alreadyThere} already on Dev.to.`,
  )
  if (created > 0) {
    console.log('Review and publish them from your Dev.to dashboard.')
  }
  if (hadFailure) process.exitCode = 1
}

main()
