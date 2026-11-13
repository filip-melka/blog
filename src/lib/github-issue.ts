const REPO_URL = 'https://github.com/filip-melka/blog'
const SITE_URL = 'https://filipmelka.com'

export interface IssueContext {
  title: string
  slug: string
  /** Repo-relative path of the article source, e.g. `src/articles/foo.mdx`. */
  filePath: string
  /** Optional section heading and its anchor id. */
  section?: { heading: string; id: string }
}

/** Builds a GitHub "new issue" URL prefilled with the article's details. */
export function buildIssueUrl({ title, slug, filePath, section }: IssueContext): string {
  const articleUrl = `${SITE_URL}/blog/${slug}/`
  const sectionUrl = section ? `${articleUrl}#${section.id}` : null

  const body = [
    `**Article:** [${title}](${articleUrl})`,
    `**Source:** [${filePath}](${REPO_URL}/blob/main/${filePath})`,
    ...(section ? [`**Section:** [${section.heading}](${sectionUrl})`] : []),
    '',
    "### What's wrong?",
    '',
    '',
    '### Suggested fix (optional)',
    '',
  ].join('\n')

  const params = new URLSearchParams({
    labels: 'article',
    title: section ? `[Article] ${title} → ${section.heading}` : `[Article] ${title}`,
    body,
  })

  return `${REPO_URL}/issues/new?${params}`
}
