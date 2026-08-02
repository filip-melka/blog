import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET(context) {
  const articles = await getCollection('articles')
  return rss({
    title: 'Filip’s Blog',
    description:
      'Writing on computer science, math, and programming - explained from first principles.',
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.pubDate,
      description: article.data.description,
      link: `/blog/${article.id}/`,
    })),
  })
}
