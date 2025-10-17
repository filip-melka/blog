import React from 'react'

function prose(Story) {
  return (
    <>
      <div data-theme="light" className="bg-bg text-text">
        <Story />
      </div>
      <div data-theme="dark" className="bg-bg text-text">
        <Story />
      </div>
    </>
  )
}

export default prose
