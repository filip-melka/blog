import type { Meta, StoryObj } from '@storybook/react-vite'

import { CircleInsideSquare } from './circle-inside-square'

const meta = {
  title: 'Articles/CircleInsideSquare',
  component: CircleInsideSquare,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CircleInsideSquare>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
