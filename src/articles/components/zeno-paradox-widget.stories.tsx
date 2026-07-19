import type { Meta, StoryObj } from '@storybook/react-vite'

import { ZenoParadoxWidget } from './zeno-paradox-widget'

const meta = {
  title: 'Articles/ZenoParadoxWidget',
  component: ZenoParadoxWidget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ZenoParadoxWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const FewStepsAllowed: Story = {
  args: {
    maxSteps: 3,
  },
}
