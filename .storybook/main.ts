import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: '@storybook/react-vite',
  async viteFinal(config) {
    config.plugins ??= []
    config.plugins.push(tailwindcss())
    return config
  },
}
export default config
