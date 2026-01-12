import { glob } from "astro/loaders"
import { defineCollection, z } from "astro:content"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      pubDate: z.date().optional(),
      updatedDate: z.date().optional(),
      banner: image(),
      tags: z.array(z.string()),
    }),
})

export const collections = { blog }
