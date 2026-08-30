import { KatexMath } from './katex-math'

const CIRCLE_COLOR = '#3ddc70'
const SQUARE_COLOR = '#4c8bf5'

export function CircleSquareRatio() {
  return (
    <div
      className="not-prose my-6 flex items-center justify-center gap-6"
      role="img"
      aria-label="The ratio of the circle's area to the square's area equals pi r squared over 4 r squared, which simplifies to pi over 4"
    >
      <div aria-hidden className="flex flex-col items-center gap-2">
        <div
          className="text-text h-16 w-16 rounded-full border-2 border-current"
          style={{ backgroundColor: CIRCLE_COLOR }}
        />
        <div className="bg-text h-0.5 w-16" />
        <div
          className="text-text h-16 w-16 border-2 border-current"
          style={{ backgroundColor: SQUARE_COLOR }}
        />
      </div>

      <div aria-hidden className="flex items-center gap-6">
        <KatexMath className="text-3xl" math="=" />
        <KatexMath className="text-3xl" math="\dfrac{\pi r^2}{4r^2}" />
        <KatexMath className="text-3xl" math="=" />
        <KatexMath className="text-3xl" math="\dfrac{\pi}{4}" />
      </div>
    </div>
  )
}
