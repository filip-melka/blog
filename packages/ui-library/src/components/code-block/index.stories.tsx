import type { Meta, StoryObj } from '@storybook/react-vite'

import CodeBlock from '.'

const meta = {
  component: CodeBlock,
  title: 'Components/Code Block',
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    language: 'js',
    children: (
      <>
        {/* prettier-ignore */}
        <pre>
  <code>
    <span className="line">
      <span style={{ color: "#FF79C6" }}>const</span>
      <span style={{ color: "#F8F8F2" }}> myVar </span>
      <span style={{ color: "#FF79C6" }}>=</span>
      <span style={{ color: "#BD93F9" }}> 5</span>
    </span>
    {"\n"}
    <span className="line"></span>
    {"\n"}
    <span className="line">
      <span style={{ color: "#FF79C6" }}>function</span>
      <span style={{ color: "#50FA7B" }}> handleClick</span>
      <span style={{ color: "#F8F8F2" }}>() &#123;</span>
    </span>
    {"\n"}
    <span className="line">
      <span style={{ color: "#F8F8F2" }}>	console.</span>
      <span style={{ color: "#50FA7B" }}>log</span>
      <span style={{ color: "#F8F8F2" }}>(</span>
      <span style={{ color: "#E9F284" }}>'</span>
      <span style={{ color: "#F1FA8C" }}>Hello World</span>
      <span style={{ color: "#E9F284" }}>'</span>
      <span style={{ color: "#F8F8F2" }}>)</span>
    </span>
    {"\n"}
    <span className="line">
      <span style={{ color: "#F8F8F2" }}>&#125;</span>
    </span>
  </code>
</pre>
      </>
    ),
  },
}
