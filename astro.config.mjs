// @ts-check
import { defineConfig } from 'astro/config'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import tailwindcss from '@tailwindcss/vite'

import icon from 'astro-icon'

import mdx from '@astrojs/mdx'

import solidJs from '@astrojs/solid-js'

import svelte from '@astrojs/svelte'

export default defineConfig({
	site: 'https://filip-melka.github.io',
	base: '/blog',
	vite: {
		plugins: [tailwindcss()]
	},

	integrations: [icon(), mdx(), solidJs(), svelte()],

	markdown: {
		shikiConfig: {
			theme: 'dracula'
		},
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex]
	}
})
