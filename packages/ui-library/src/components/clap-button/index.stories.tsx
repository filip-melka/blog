import type { Meta, StoryObj } from '@storybook/react-vite'

import ClapButton from '.'

const meta = {
  component: ClapButton,
  title: 'Components/Clap Button',
} satisfies Meta<typeof ClapButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    fetchClaps: fetchClaps,
    saveAddedClaps: saveClaps,
  },
}

function fetchClaps(): Promise<number | Error> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const shouldFail = false
      if (shouldFail) {
        resolve(new Error('Failed to fetch claps'))
      } else {
        const claps = Math.floor(Math.random() * 100)
        resolve(claps)
      }
    }, 1000)
  })
}

function saveClaps(noOfClaps: number) {
  console.log('added:', noOfClaps)
}
