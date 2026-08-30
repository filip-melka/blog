import type { Meta, StoryObj } from '@storybook/react-vite'

import { MonteCarloAddPoint } from './monte-carlo-add-point'

const meta = {
  title: 'Articles/MonteCarloAddPoint',
  component: MonteCarloAddPoint,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MonteCarloAddPoint>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
