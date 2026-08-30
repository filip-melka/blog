import { useEffect, useState } from 'react'

import type { Point } from './monte-carlo-shared'

type Props = {
  points: Point[]
  // When true, each point fades out shortly after it appears instead of
  // staying on screen forever - keeps a long auto-run from turning into a
  // solid smear of dots.
  fade?: boolean
}

// The square spans x/y in [1.5, 148.5] (a 150x150 viewBox with a 1.5px inset
// for the 3px stroke), centered at (75, 75). The circle's radius matches the
// square's half-width exactly, so it touches all four sides - and points are
// scaled by this exact same radius, so a point classified "inside" against
// the true unit circle always renders inside the drawn circle, and vice
// versa. A point's own dot can occasionally overlap the square's outline
// right at the edge, but that's cosmetic - it never misrepresents which side
// of the circle a point actually falls on.
const CIRCLE_RADIUS = 73.5
const POINT_DOT_RADIUS = 6
const POINT_VISIBLE_MS = 1000
const POINT_FADE_MS = 350

function FadingPoint({ point, fade }: { point: Point; fade: boolean }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!fade) return
    const timeout = setTimeout(() => setVisible(false), POINT_VISIBLE_MS)
    return () => clearTimeout(timeout)
  }, [fade])

  return (
    <circle
      cx={75 + point.x * CIRCLE_RADIUS}
      cy={75 + point.y * CIRCLE_RADIUS}
      r={POINT_DOT_RADIUS}
      fill={point.inside ? '#55d949' : '#e45d5c'}
      style={
        fade
          ? {
              opacity: visible ? 1 : 0,
              transition: `opacity ${POINT_FADE_MS}ms ease`,
            }
          : undefined
      }
    />
  )
}

export function MonteCarloCanvas({ points, fade = false }: Props) {
  const insideCount = points.filter((p) => p.inside).length
  const outsideCount = points.length - insideCount

  return (
    <svg
      viewBox="0 0 150 150"
      className="text-text h-[150px] w-[150px]"
      role="img"
      aria-label={`A square with a circle inscribed inside it, containing ${points.length} scattered points: ${insideCount} inside the circle, ${outsideCount} outside it`}
    >
      <rect
        x="1.5"
        y="1.5"
        width="147"
        height="147"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle
        cx="75"
        cy="75"
        r={CIRCLE_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="6 5"
      />
      {points.map((p) => (
        <FadingPoint key={p.id} point={p} fade={fade} />
      ))}
    </svg>
  )
}
