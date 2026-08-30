import { KatexMath } from './katex-math'

// Static illustration pairing the square and the inscribed circle with the
// area formulas from the surrounding prose ($4r^2$ for the square, $\pi r^2$
// for the circle) - shaded in the same colors as the Penpot design so the
// reader can visually connect each shape to its area.
export function AreaComparison() {
  return (
    <div className="not-prose my-6 flex justify-center">
      <div className="text-text relative w-72">
        <svg
          viewBox="-4 -4 272 162"
          className="h-auto w-full"
          role="img"
          aria-label="A green square labeled 4 r squared, next to a blue circle labeled pi r squared, illustrating each shape's area"
        >
          <rect
            x="0"
            y="0"
            width="102"
            height="102"
            fill="#33e463"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="213"
            cy="51"
            r="51"
            fill="#4484f4"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <div
          className="text-text/60 absolute -translate-x-1/2 -translate-y-1/2 text-4xl"
          style={{ left: '20.22%', top: '83.95%' }}
        >
          <KatexMath math="4r^2" />
        </div>
        <div
          className="text-text/60 absolute -translate-x-1/2 -translate-y-1/2 text-4xl"
          style={{ left: '79.78%', top: '83.95%' }}
        >
          <KatexMath math="\pi r^2" />
        </div>
      </div>
    </div>
  )
}
