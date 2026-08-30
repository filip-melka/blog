import type { Meta, StoryObj } from '@storybook/react-vite'

import { SquareDiagram } from './square-diagram'

const meta = {
  title: 'Articles/SquareDiagram',
  component: SquareDiagram,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SquareDiagram>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
