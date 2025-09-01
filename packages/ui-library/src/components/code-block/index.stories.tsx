import type { Meta, StoryObj } from '@storybook/react-vite'

import CodeBlock from '.'
import maxWidth from '../../decorators/max-width'

const meta = {
  component: CodeBlock,
  title: 'Components/Code Block',
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  decorators: [maxWidth],
  args: {
    language: 'python',
    children: (
      <>
        {/* prettier-ignore */}
        <pre style={{overflowX: 'auto'}} dangerouslySetInnerHTML={{__html: `<code><span class="line"><span style="color:#FF79C6">from</span><span style="color:#F8F8F2"> nltk.tokenize </span><span style="color:#FF79C6">import</span><span style="color:#F8F8F2"> word_tokenize</span></span>
<span class="line"><span style="color:#FF79C6">import</span><span style="color:#F8F8F2"> string</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F8F8F2">document </span><span style="color:#FF79C6">=</span><span style="color:#F8F8F2"> documents[</span><span style="color:#BD93F9">0</span><span style="color:#F8F8F2">] </span><span style="color:#6272A4"># "The cat is sleeping on the couch."</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4"># Tokenization</span></span>
<span class="line"><span style="color:#F8F8F2">words </span><span style="color:#FF79C6">=</span><span style="color:#F8F8F2"> word_tokenize(document)</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4"># Lowercasing and removing punctuation</span></span>
<span class="line"><span style="color:#F8F8F2">preprocessed_words </span><span style="color:#FF79C6">=</span><span style="color:#F8F8F2"> [word.lower() </span><span style="color:#FF79C6">for</span><span style="color:#F8F8F2"> word </span><span style="color:#FF79C6">in</span><span style="color:#F8F8F2"> words </span><span style="color:#FF79C6">if</span><span style="color:#F8F8F2"> word </span><span style="color:#FF79C6">not</span><span style="color:#FF79C6"> in</span><span style="color:#F8F8F2"> string.punctuation]</span></span></code>`}}>
</pre>
      </>
    ),
  },
}
