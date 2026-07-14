import { create } from 'storybook/theming'
import banner from './assets/banner.png'

export default create({
  base: 'light',
  brandTitle: "Filip's Blog",
  brandUrl: '/',
  brandImage: banner,
  brandTarget: '_self',
})
