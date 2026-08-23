import type { Meta, StoryObj } from '@storybook/react-vite'

import { StackVisualizer } from './stack-visualizer'

const meta = {
  title: 'Articles/StackVisualizer',
  component: StackVisualizer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StackVisualizer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    initialItems: [8, 7, 42],
    initialPopped: 15,
  },
}

export const Empty: Story = {
  args: {
    initialItems: [],
    initialPopped: null,
  },
}

export const Full: Story = {
  args: {
    initialItems: [3, 12, 27, 9],
    initialPopped: null,
  },
}
