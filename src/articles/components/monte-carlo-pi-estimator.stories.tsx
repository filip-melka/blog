import type { Meta, StoryObj } from '@storybook/react-vite'

import { MonteCarloPiEstimator } from './monte-carlo-pi-estimator'

const meta = {
  title: 'Articles/MonteCarloPiEstimator',
  component: MonteCarloPiEstimator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MonteCarloPiEstimator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
