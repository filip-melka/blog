import type { Preview } from '@storybook/react-vite'
import '../src/styles/global.css'
import { withColorScheme } from './decorators/with-color-scheme'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withColorScheme],
  globalTypes: {
    scheme: {
      name: 'Scheme',
      description: 'Select light or dark theme',
      toolbar: {
        icon: 'mirror',
        items: ['light', 'dark', 'both'],
      },
    },
  },
  initialGlobals: {
    scheme: 'both',
  },
}

export default preview
