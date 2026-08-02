// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import mdx from '@astrojs/mdx'
import { unified } from '@astrojs/markdown-remark'
import { remarkReadingTime } from './src/plugins/remark/reading-time.ts'
import { remarkWrapCodeBlocks } from './src/plugins/remark/wrap-code-blocks.ts'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeExternalLinks from 'rehype-external-links'
import { transformerMetaHighlight } from '@shikijs/transformers'

import react from '@astrojs/react'

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://filipmelka.com',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      transformers: [transformerMetaHighlight()],
    },
    processor: unified({
      remarkPlugins: [remarkReadingTime, remarkMath, remarkWrapCodeBlocks],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypeExternalLinks,
          { target: '_blank', rel: ['noopener', 'noreferrer'] },
        ],
      ],
    }),
  },

  integrations: [mdx(), react(), sitemap()],
})