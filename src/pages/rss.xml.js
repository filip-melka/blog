import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET(context) {
  const articles = await getCollection('articles')
  return rss({
    title: 'Filip’s Blog',
    description:
      'Writing on computer science, math, and programming - explained from first principles.',
    site: context.site,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    items: articles.map((article) => {
      const banner = article.data.banner
      const bannerType = `image/${banner.format}`
      const bannerUrl = new URL(banner.src, context.site).href

      return {
        title: article.data.title,
        pubDate: article.data.pubDate,
        description: article.data.description,
        link: `/blog/${article.id}/`,
        enclosure: {
          url: bannerUrl,
          length: 0,
          type: bannerType,
        },
        customData: `<media:content url="${bannerUrl}" medium="image" type="${bannerType}" width="${banner.width}" height="${banner.height}" />`,
      }
    }),
  })
}
