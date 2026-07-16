import type { Decorator } from '@storybook/react-vite'

export const withColorScheme: Decorator = (Story, context) => {
  const { scheme } = context.globals
  const modes =
    scheme === 'light' || scheme === 'dark' ? [scheme] : ['light', 'dark']

  return (
    <div className="flex flex-col">
      {modes.map((mode) => (
        <section key={mode} className={mode === 'dark' ? 'dark' : ''}>
          <div className="bg-bg text-text p-8">
            <Story />
          </div>
        </section>
      ))}
    </div>
  )
}
