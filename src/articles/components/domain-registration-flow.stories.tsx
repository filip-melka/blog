import type { Meta, StoryObj } from '@storybook/react-vite'

import { DomainRegistrationFlow } from './domain-registration-flow'

const meta = {
  title: 'Articles/DomainRegistrationFlow',
  component: DomainRegistrationFlow,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DomainRegistrationFlow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
