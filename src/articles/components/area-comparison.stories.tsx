import type { Meta, StoryObj } from '@storybook/react-vite'

import { AreaComparison } from './area-comparison'

const meta = {
  title: 'Articles/AreaComparison',
  component: AreaComparison,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AreaComparison>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
