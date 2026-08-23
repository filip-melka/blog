import type { Meta, StoryObj } from '@storybook/react-vite'

import { NaiveEvaluatorWidget } from './naive-evaluator-widget'

const meta = {
  title: 'Articles/NaiveEvaluatorWidget',
  component: NaiveEvaluatorWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NaiveEvaluatorWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    expression: '3+5-2',
  },
}

export const WrongPrecedence: Story = {
  args: {
    expression: '3+5/2',
  },
}
