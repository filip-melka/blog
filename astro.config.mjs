// @ts-check
import { defineConfig } from "astro/config"
import tailwindcss from "@tailwindcss/vite"
import mdx from "@astrojs/mdx"
import codeBlockWrapper from "./remark-plugins/code-block-wrapper"
import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), react()],

  site: "https://filip-melka.github.io",
  base: "/blog",

  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "dracula",
    },
    remarkPlugins: [codeBlockWrapper],
  },
})
