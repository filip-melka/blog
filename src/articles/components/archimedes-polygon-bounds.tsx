import { useId, useState } from 'react'

import { KatexMath } from './katex-math'

type Props = {
  initialSides?: number
  minSides?: number
  maxSides?: number
}

const DEFAULT_MIN_SIDES = 4
const DEFAULT_MAX_SIDES = 10

// The circumscribed polygon's color matches the outer square in the Penpot
// board, the inscribed polygon's color matches the inner square.
const CIRCUMSCRIBED_COLOR = '#67d864'
const INSCRIBED_COLOR = '#4393da'

const RADIUS = 50
const VIEWBOX = 80

type Point = [number, number]

// A regular n-gon inscribed in a circle of the given radius has its vertices
// on the circle. A regular n-gon circumscribing the same circle (its edges
// tangent to the circle) shares the exact same vertex angles - it's simply
// the inscribed polygon scaled outward by 1/cos(pi/n), since its apothem
// (center-to-edge distance) must equal the circle's radius.
function polygonVertices(sides: number, radius: number): Point[] {
  return Array.from({ length: sides }, (_, k) => {
    const angle = -Math.PI / 2 + (k * 2 * Math.PI) / sides
    return [radius * Math.cos(angle), radius * Math.sin(angle)]
  })
}

function pointsAttribute(points: Point[]): string {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

// Archimedes' method: a circle's circumference always falls strictly between
// the perimeter of a regular n-gon inscribed in it and one circumscribing it.
// Dividing each perimeter by the diameter gives a lower/upper bound on pi.
function computeBounds(sides: number) {
  const lower = sides * Math.sin(Math.PI / sides)
  const upper = sides * Math.tan(Math.PI / sides)
  return { lower, upper }
}

export function ArchimedesPolygonBounds({
  initialSides = DEFAULT_MIN_SIDES,
  minSides = DEFAULT_MIN_SIDES,
  maxSides = DEFAULT_MAX_SIDES,
}: Props) {
  const [sides, setSides] = useState(initialSides)
  const sliderId = useId()

  const inscribed = polygonVertices(sides, RADIUS)
  const circumscribedRadius = RADIUS / Math.cos(Math.PI / sides)
  const circumscribed = polygonVertices(sides, circumscribedRadius)
  const { lower, upper } = computeBounds(sides)

  return (
    <div className="not-prose bg-bg mx-auto my-6 flex w-full max-w-[320px] flex-col items-center gap-6 px-6 py-8 sm:max-w-[440px] sm:gap-8 sm:px-8 sm:py-10">
      <KatexMath
        className="text-xl whitespace-nowrap sm:text-2xl"
        math={`\\textcolor{${INSCRIBED_COLOR}}{${lower.toFixed(4)}} < \\pi < \\textcolor{${CIRCUMSCRIBED_COLOR}}{${upper.toFixed(4)}}`}
      />

      <svg
        viewBox={`-${VIEWBOX} -${VIEWBOX} ${VIEWBOX * 2} ${VIEWBOX * 2}`}
        className="text-text h-[200px] w-[200px] sm:h-[260px] sm:w-[260px]"
        role="img"
        aria-label={`A circle with a ${sides}-sided polygon inscribed inside it and a ${sides}-sided polygon circumscribing it`}
      >
        <polygon
          points={pointsAttribute(circumscribed)}
          fill="none"
          stroke={CIRCUMSCRIBED_COLOR}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <polygon
          points={pointsAttribute(inscribed)}
          fill="none"
          stroke={INSCRIBED_COLOR}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <circle
          cx={0}
          cy={0}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />
      </svg>

      <div className="flex w-full flex-col gap-2">
        <label
          htmlFor={sliderId}
          className="text-text/80 self-center text-base tabular-nums sm:text-lg"
        >
          n={sides}
        </label>
        <input
          id={sliderId}
          type="range"
          min={minSides}
          max={maxSides}
          step={1}
          value={sides}
          onChange={(event) => setSides(Number(event.target.value))}
          aria-label="Number of polygon sides"
          className="[&::-moz-range-thumb]:bg-text [&::-webkit-slider-thumb]:bg-text [&::-webkit-slider-runnable-track]:bg-text/20 [&::-moz-range-track]:bg-text/20 h-[15px] w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-[15px] [&::-moz-range-thumb]:w-[15px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:mt-[-5.5px] [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>
    </div>
  )
}
