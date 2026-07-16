import type { Meta, StoryObj } from '@storybook/react-vite'

import { CodeBlock } from './code-block'

const meta = {
  title: 'React/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

const javaHtml = `<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8;overflow-x:auto" tabindex="0" data-language="java"><code><span class="line"><span style="color:#F97583">double</span><span style="color:#E1E4E8"> fahrenheit </span><span style="color:#F97583">=</span><span style="color:#79B8FF"> 32</span><span style="color:#F97583"> +</span><span style="color:#E1E4E8"> celsius </span><span style="color:#F97583">*</span><span style="color:#79B8FF"> 9</span><span style="color:#F97583"> /</span><span style="color:#79B8FF"> 5</span><span style="color:#E1E4E8">;</span></span></code></pre>`

const tsxHtml = `<pre class="astro-code github-dark" style="background-color:#24292e;color:#e1e4e8;overflow-x:auto" tabindex="0" data-language="tsx"><code><span class="line"><span style="color:#F97583">function</span><span style="color:#B392F0"> greet</span><span style="color:#E1E4E8">(</span><span style="color:#FFAB70">name</span><span style="color:#F97583">:</span><span style="color:#79B8FF"> string</span><span style="color:#E1E4E8">) {</span></span>
<span class="line"><span style="color:#F97583">  return</span><span style="color:#9ECBFF"> \`Hello, \${</span><span style="color:#E1E4E8">name</span><span style="color:#9ECBFF">}!\`</span></span>
<span class="line"><span style="color:#E1E4E8">}</span></span></code></pre>`

export const Default: Story = {
  args: {
    lang: 'java',
    children: <div dangerouslySetInnerHTML={{ __html: javaHtml }} />,
  },
}

export const MultiLine: Story = {
  args: {
    lang: 'tsx',
    children: <div dangerouslySetInnerHTML={{ __html: tsxHtml }} />,
  },
}
