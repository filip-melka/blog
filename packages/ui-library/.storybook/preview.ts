import type { Preview } from '@storybook/react-vite'
import '../../app/src/styles/global.css'
import prose from './decorators/prose'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [prose],
}

export default preview
