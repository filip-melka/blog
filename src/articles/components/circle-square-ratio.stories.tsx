import type { Meta, StoryObj } from '@storybook/react-vite'

import { CircleSquareRatio } from './circle-square-ratio'

const meta = {
  title: 'Articles/CircleSquareRatio',
  component: CircleSquareRatio,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CircleSquareRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
