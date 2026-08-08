// Thin Dev.to (Forem) API client. Every network call the exporter makes lives
// here. The exporter only ever creates drafts and never edits an article it has
// already published, so there is deliberately no PUT in this file.
const API_BASE = 'https://dev.to/api'
const PER_PAGE = 1000 // documented maximum
const MAX_PAGES = 20
const MAX_RETRIES = 3

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function request(
  path,
  { apiKey, method = 'GET', body, attempt = 1 } = {},
) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'api-key': apiKey,
      accept: 'application/vnd.forem.api-v1+json',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 429 && attempt <= MAX_RETRIES) {
    const waitMs = Number(response.headers.get('retry-after') ?? 30) * 1000
    console.warn(
      `Dev.to rate limit hit on ${method} ${path}; retrying in ${waitMs / 1000}s.`,
    )
    await sleep(waitMs)
    return request(path, { apiKey, method, body, attempt: attempt + 1 })
  }

  if (!response.ok) {
    throw new Error(
      `${method} ${path} failed: ${response.status} ${response.statusText} - ` +
        `${await response.text()}`,
    )
  }
  return response.json()
}

// Trailing slashes and case differ between what we send and what Forem echoes
// back, and a missed match here means a second copy of an article that already
// exists - the only way this exporter can damage anything.
export function normalizeUrl(url) {
  if (typeof url !== 'string' || url === '') return ''
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.replace(/\/+$/, '')
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${pathname}`
  } catch {
    return url.replace(/\/+$/, '').toLowerCase()
  }
}

async function collectCanonicalUrls(apiKey, listing, into) {
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await request(
      `/articles/me/${listing}?page=${page}&per_page=${PER_PAGE}`,
      { apiKey },
    )
    for (const article of batch) {
      // Articles whose canonical_url was never set come back with their own
      // dev.to URL in that field, so they can never collide with a
      // filipmelka.com canonical.
      const key = normalizeUrl(article.canonical_url)
      if (key !== '') into.add(key)
    }
    if (batch.length < PER_PAGE) return
  }
  // A truncated listing reads as "not found", which would create a second copy
  // of an article that already exists. Refuse rather than guess.
  throw new Error(
    `Stopped after ${MAX_PAGES} pages of /articles/me/${listing}; refusing to ` +
      `guess whether an article already exists.`,
  )
}

// This is the only thing standing between a deploy and a duplicate, so it asks
// for drafts and live posts explicitly rather than trusting me/all to span both.
// Getting that wrong would mean every deploy silently creating another copy of
// every article, unattended.
export async function fetchMyCanonicalUrls(apiKey) {
  const canonicalUrls = new Set()
  await collectCanonicalUrls(apiKey, 'published', canonicalUrls)
  await collectCanonicalUrls(apiKey, 'unpublished', canonicalUrls)
  return canonicalUrls
}

export const createArticle = (apiKey, article) =>
  request('/articles', { apiKey, method: 'POST', body: { article } })
