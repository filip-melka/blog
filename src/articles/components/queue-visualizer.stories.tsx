import type { Meta, StoryObj } from '@storybook/react-vite'

import { QueueVisualizer } from './queue-visualizer'

const meta = {
  title: 'Articles/QueueVisualizer',
  component: QueueVisualizer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QueueVisualizer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    initialQueue: [42, 88],
    maxCapacity: 5,
  },
}

export const Empty: Story = {
  args: {
    initialQueue: [],
    maxCapacity: 5,
  },
}

export const Full: Story = {
  args: {
    initialQueue: [42, 88, 15, 7, 23],
    maxCapacity: 5,
  },
}
