// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import mdx from '@astrojs/mdx'
import { unified } from '@astrojs/markdown-remark'
import { remarkReadingTime } from './src/plugins/remark/reading-time.ts'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import react from '@astrojs/react'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkReadingTime, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },

  integrations: [mdx(), react()],
})
