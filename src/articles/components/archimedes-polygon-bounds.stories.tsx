import type { Meta, StoryObj } from '@storybook/react-vite'

import { ArchimedesPolygonBounds } from './archimedes-polygon-bounds'

const meta = {
  title: 'Articles/ArchimedesPolygonBounds',
  component: ArchimedesPolygonBounds,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArchimedesPolygonBounds>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const MaxSides: Story = {
  args: {
    initialSides: 10,
  },
}
