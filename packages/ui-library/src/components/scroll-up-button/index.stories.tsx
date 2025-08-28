import type { Meta, StoryObj } from '@storybook/react-vite'

import ScrollUpButton from '.'

const meta = {
  component: ScrollUpButton,
  title: 'Components/Scroll Up Button',
} satisfies Meta<typeof ScrollUpButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {},
}
