import type { Meta, StoryObj } from '@storybook/react-vite'

import { ElmArchitectureExplainer } from './elm-architecture-explainer'

const meta = {
  title: 'Articles/ElmArchitectureExplainer',
  component: ElmArchitectureExplainer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ElmArchitectureExplainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    initialCount: 0,
  },
}

export const StartingAtFive: Story = {
  args: {
    initialCount: 5,
  },
}
