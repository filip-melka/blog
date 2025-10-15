import type { Meta, StoryObj } from '@storybook/react-vite'

import maxWidth from '../../../decorators/max-width'
import ComputePrecision from '.'

const meta = {
  component: ComputePrecision,
  title: 'Articles/BLEU/Compute Precision',
} satisfies Meta<typeof ComputePrecision>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  decorators: [maxWidth],
}
