import type { Meta, StoryObj } from '@storybook/react-vite'

import maxWidth from '../../../decorators/max-width'
import NGram from '.'

const meta = {
  component: NGram,
  title: 'Articles/BLEU/N-Grams',
} satisfies Meta<typeof NGram>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  decorators: [maxWidth],
}
