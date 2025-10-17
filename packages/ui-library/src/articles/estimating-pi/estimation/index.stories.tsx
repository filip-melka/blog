import type { Meta, StoryObj } from '@storybook/react-vite'

import Estimation from '.'
import maxWidth from '../../../decorators/max-width'

const meta = {
  component: Estimation,
  title: 'Articles/Estimating Pi/Estimation',
} satisfies Meta<typeof Estimation>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  decorators: [maxWidth],
}
