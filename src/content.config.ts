import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      banner: image(),
      categories: z.array(z.string()),
      blueskyText: z.string().optional(),
      blueskyHashtags: z.boolean().optional(),
    }),
})

export const collections = { articles }
