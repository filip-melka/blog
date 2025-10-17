import type { Preview } from '@storybook/react-vite'
import '../../app/src/styles/global.css'
import prose from './decorators/prose'
import theme from './decorators/theme'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [theme, prose],
}

export default preview
