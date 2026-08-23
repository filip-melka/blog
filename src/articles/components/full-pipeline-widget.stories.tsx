import type { Meta, StoryObj } from '@storybook/react-vite'

import { FullPipelineWidget } from './full-pipeline-widget'

const meta = {
  title: 'Articles/FullPipelineWidget',
  component: FullPipelineWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FullPipelineWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const NoBrackets: Story = {
  args: {
    expression: '9 - 3 - 2',
  },
}

export const RightAssociativeExponent: Story = {
  args: {
    expression: '2 ^ 3 ^ 2',
  },
}
