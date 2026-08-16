import type { Meta, StoryObj } from '@storybook/react-vite'

import { BlueskyAutomationFlow } from './bluesky-automation-flow'

const meta = {
  title: 'Articles/BlueskyAutomationFlow',
  component: BlueskyAutomationFlow,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BlueskyAutomationFlow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
