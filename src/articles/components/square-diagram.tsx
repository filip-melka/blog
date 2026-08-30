import { useId } from 'react'

import { KatexMath } from './katex-math'

export function SquareDiagram() {
  const startArrowId = useId()
  const endArrowId = useId()

  return (
    <div className="not-prose my-6 flex justify-center">
      <div className="text-text relative w-56">
        <svg
          viewBox="-4 -4 158 202"
          className="h-auto w-full"
          role="img"
          aria-label="A square with a side length of 2r"
        >
          <defs>
            <marker
              id={startArrowId}
              viewBox="0 0 10 10"
              refX="4"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path
                d="M8,1 L2,5 L8,9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </marker>
            <marker
              id={endArrowId}
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path
                d="M2,1 L8,5 L2,9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </marker>
          </defs>

          <rect
            x="0"
            y="44"
            width="150"
            height="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="30"
            x2="150"
            y2="30"
            className="text-text/60"
            stroke="currentColor"
            strokeWidth="2"
            markerStart={`url(#${startArrowId})`}
            markerEnd={`url(#${endArrowId})`}
          />
        </svg>
        <div
          className="text-text/60 absolute -translate-x-1/2 -translate-y-1/2 text-2xl"
          style={{ left: '50%', top: '8.91%' }}
        >
          <KatexMath math="2r" />
        </div>
      </div>
    </div>
  )
}
