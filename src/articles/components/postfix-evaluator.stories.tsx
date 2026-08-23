import type { Meta, StoryObj } from '@storybook/react-vite'

import { PostfixEvaluator } from './postfix-evaluator'

const meta = {
  title: 'Articles/PostfixEvaluator',
  component: PostfixEvaluator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PostfixEvaluator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    expression: '5 1 2 + 4 * + 3 -',
  },
}

export const Simple: Story = {
  args: {
    expression: '2 3 +',
  },
}
