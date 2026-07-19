import type { Meta, StoryObj } from '@storybook/react-vite'

import { ComparisonReveal } from './comparison-reveal'

const meta = {
  title: 'Articles/ComparisonReveal',
  component: ComparisonReveal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ComparisonReveal>

export default meta
type Story = StoryObj<typeof meta>

export const Equal: Story = {
  args: {
    left: '0.999...',
    right: '1',
    sign: '=',
  },
}

export const LessThan: Story = {
  args: {
    left: '3',
    right: '5',
    sign: '<',
  },
}

export const GreaterThan: Story = {
  args: {
    left: '2',
    right: '1',
    sign: '>',
  },
}
