import type { Meta, StoryObj } from '@storybook/react-vite'

import { ShuntingYardWidget } from './shunting-yard-widget'

const meta = {
  title: 'Articles/ShuntingYardWidget',
  component: ShuntingYardWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ShuntingYardWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const RightAssociativeExponent: Story = {
  args: {
    tokens: ['2', '^', '3', '^', '2'],
  },
}

export const NoBrackets: Story = {
  args: {
    tokens: ['9', '-', '3', '-', '2'],
  },
}
