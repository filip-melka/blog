#!/usr/bin/env node
// Announces newly published articles on Bluesky with a link-card (thumbnail
// + title + description). "New" is determined by checking which article
// URLs don't already have a matching post in the account's own feed, so no
// state needs to be tracked in the repo. Only articles published within the
// last RECENT_DAYS are considered, so once the feed lookup can no longer
// reach far enough back the back catalogue still can't be reposted.
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { AtpAgent, RichText } from '@atproto/api'

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)
const ARTICLES_DIR = path.join(REPO_ROOT, 'src/articles')
const SITE_URL = 'https://filipmelka.com'
const MAX_FEED_PAGES = 20
// The feed lookup only reaches back MAX_FEED_PAGES * 100 posts. Articles
// older than this are never candidates, so they can't be reposted once they
// fall outside that window.
const RECENT_DAYS = 30

const config = JSON.parse(
  readFileSync(path.join(REPO_ROOT, 'bluesky.config.json'), 'utf8'),
)

const isDryRun = process.argv.includes('--dry-run')

function readArticles() {
  return readdirSync(ARTICLES_DIR)
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
    .map((name) => {
      const slug = path.basename(name, path.extname(name))
      const fullPath = path.join(ARTICLES_DIR, name)
      const { data } = matter(readFileSync(fullPath, 'utf8'))
      return {
        slug,
        title: data.title,
        description: data.description,
        pubDate: new Date(data.pubDate),
        bannerAbsPath: path.resolve(ARTICLES_DIR, data.banner),
        url: `${SITE_URL}/blog/${slug}/`,
        text: data.blueskyText ?? config.defaultPostText,
        categories: data.categories,
        hashtagsOverride: data.blueskyHashtags,
      }
    })
}

async function fetchAlreadyPostedUrls(agent) {
  const posted = new Set()
  let cursor
  for (let page = 0; page < MAX_FEED_PAGES; page++) {
    const { data } = await agent.getAuthorFeed({
      actor: agent.session.did,
      limit: 100,
      cursor,
    })
    for (const item of data.feed) {
      const embed = item.post.record?.embed
      if (embed?.$type === 'app.bsky.embed.external' && embed.external?.uri) {
        posted.add(embed.external.uri)
      }
    }
    cursor = data.cursor
    if (!cursor) break
  }
  return posted
}

function categoriesToHashtags(categories) {
  return categories.map((c) => `#${c.replace(/\s+/g, '')}`).join(' ')
}

function buildFinalText(article) {
  const hashtagsEnabled = article.hashtagsOverride ?? config.hashtagsEnabled
  const hashtags = hashtagsEnabled
    ? categoriesToHashtags(article.categories)
    : ''
  return [article.text, hashtags].filter(Boolean).join('\n\n')
}

async function postArticle(agent, article) {
  const bannerBytes = readFileSync(article.bannerAbsPath)
  const { data: blob } = await agent.uploadBlob(bannerBytes, {
    encoding: 'image/png',
  })

  const rt = new RichText({ text: buildFinalText(article) })
  await rt.detectFacets(agent)

  await agent.post({
    text: rt.text,
    facets: rt.facets,
    embed: {
      $type: 'app.bsky.embed.external',
      external: {
        uri: article.url,
        title: article.title,
        description: article.description,
        thumb: blob.blob,
      },
    },
    createdAt: new Date().toISOString(),
  })
}

async function main() {
  const articles = readArticles()

  const agent = new AtpAgent({ service: 'https://bsky.social' })
  await agent.login({
    identifier: process.env.BLUESKY_IDENTIFIER,
    password: process.env.BLUESKY_APP_PASSWORD,
  })

  const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000

  const alreadyPosted = await fetchAlreadyPostedUrls(agent)
  const unposted = articles.filter((article) => !alreadyPosted.has(article.url))
  const candidates = unposted
    .filter((article) => article.pubDate.getTime() > cutoff)
    .sort((a, b) => a.pubDate - b.pubDate)

  // An article with no post and a pubDate older than the window is almost
  // always a pubDate that wasn't bumped to the publish date. Say so instead
  // of silently reporting nothing to do.
  for (const article of unposted) {
    if (article.pubDate.getTime() <= cutoff) {
      console.warn(
        `Skipping "${article.slug}": never posted, but its pubDate ` +
          `(${article.pubDate.toISOString().slice(0, 10)}) is older than ` +
          `${RECENT_DAYS} days. Bump pubDate if it should be announced.`,
      )
    }
  }

  if (candidates.length === 0) {
    console.log('No new articles to post.')
    return
  }

  let hadFailure = false
  for (const article of candidates) {
    if (isDryRun) {
      console.log(
        `[dry-run] Would post "${article.slug}" as a link card:\n` +
          `  text: ${buildFinalText(article)}\n` +
          `  title: ${article.title}\n` +
          `  description: ${article.description}\n` +
          `  uri: ${article.url}\n` +
          `  thumb: ${article.bannerAbsPath}\n---`,
      )
      continue
    }
    try {
      await postArticle(agent, article)
      console.log(`Posted "${article.slug}" to Bluesky.`)
    } catch (err) {
      hadFailure = true
      console.error(`Failed to post "${article.slug}":`, err)
    }
  }

  if (hadFailure) process.exitCode = 1
}

main()
