import type { Meta, StoryObj } from '@storybook/react-vite'

import maxWidth from '../../../decorators/max-width'
import ClippedPrecision from '.'

const meta = {
  component: ClippedPrecision,
  title: 'Articles/BLEU/Clipped Precision',
} satisfies Meta<typeof ClippedPrecision>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  decorators: [maxWidth],
  args: {
    prediction: 'He He He eats tasty fruit',
    references: ['He is eating tasty apple', 'He eats a sweet apple'],
  },
}
