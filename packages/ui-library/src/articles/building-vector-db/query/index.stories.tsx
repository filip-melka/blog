import type { Meta, StoryObj } from '@storybook/react-vite'

import Query from '.'
import maxWidth from '../../../decorators/max-width'

const meta = {
  component: Query,
  title: 'Articles/Building Vector DB/Query',
} satisfies Meta<typeof Query>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  decorators: [maxWidth],
}
