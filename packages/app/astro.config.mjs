// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import codeBlockWrapper from './src/remark-plugins/code-block-wrapper'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
// @ts-ignore
import rehypeFigureTitle from 'rehype-figure-title'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), mdx()],

  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'dracula',
    },
    remarkPlugins: [codeBlockWrapper, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeFigureTitle],
  },
})
