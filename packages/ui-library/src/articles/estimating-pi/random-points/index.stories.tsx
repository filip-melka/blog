import type { Meta, StoryObj } from '@storybook/react-vite'

import RandomPoints from '.'
import maxWidth from '../../../decorators/max-width'

const meta = {
  component: RandomPoints,
  title: 'Articles/Estimating Pi/Random Points',
} satisfies Meta<typeof RandomPoints>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  decorators: [maxWidth],
}
