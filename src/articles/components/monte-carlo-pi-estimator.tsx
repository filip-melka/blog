import { useEffect, useRef, useState } from 'react'

import { KatexMath } from './katex-math'
import { MonteCarloCanvas } from './monte-carlo-canvas'
import type { Point } from './monte-carlo-shared'
import { MAX_POINTS, randomPoint } from './monte-carlo-shared'

const AUTO_ADD_INTERVAL_MS = 55
const PI_DIGITS = Math.PI.toFixed(5)
// A point is done fading (see monte-carlo-canvas) well within this window,
// so once it's older than this it can be dropped from the rendered set -
// the cumulative counts below are tracked separately, so dropping a point
// here never affects the estimate. Keeps the DOM bounded even after tens of
// thousands of points, instead of growing for as long as the run lasts.
const VISIBLE_WINDOW_MS = 1500

// Length of the leading run of characters shared by both strings, so the
// highlight only ever covers a correct prefix - a matching digit after a
// wrong one doesn't count, since e.g. "2.14159" isn't "correct so far".
function correctPrefixLength(estimate: string, reference: string): number {
  let length = 0
  while (length < estimate.length && estimate[length] === reference[length]) {
    length++
  }
  return length
}

export function MonteCarloPiEstimator() {
  const [visiblePoints, setVisiblePoints] = useState<Point[]>([])
  const [insideTotal, setInsideTotal] = useState(0)
  const [outsideTotal, setOutsideTotal] = useState(0)
  const [running, setRunning] = useState(false)

  const nextIdRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const total = insideTotal + outsideTotal

  function addPoint() {
    const point = randomPoint(nextIdRef.current++)
    if (point.inside) {
      setInsideTotal((count) => count + 1)
    } else {
      setOutsideTotal((count) => count + 1)
    }
    setVisiblePoints((prev) => {
      const cutoff = Date.now() - VISIBLE_WINDOW_MS
      return [...prev.filter((p) => p.addedAt >= cutoff), point]
    })
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = undefined
    setRunning(false)
  }

  // Clean up a pending interval if the component unmounts mid auto-run.
  useEffect(() => stop, [])

  // Stop automatically once the point cap is reached.
  useEffect(() => {
    if (running && total >= MAX_POINTS) stop()
  }, [total, running])

  function toggle() {
    if (running) {
      stop()
      return
    }
    setRunning(true)
    intervalRef.current = setInterval(addPoint, AUTO_ADD_INTERVAL_MS)
  }

  const estimate = total > 0 ? (4 * insideTotal) / total : null
  const estimateStr = estimate !== null ? estimate.toFixed(5) : null
  const correctLength = estimateStr
    ? correctPrefixLength(estimateStr, PI_DIGITS)
    : 0

  return (
    <div className="not-prose bg-bg mx-auto my-6 flex w-fit flex-col items-center gap-8 px-8 py-9 sm:flex-row sm:items-center sm:gap-12">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-6 text-2xl tabular-nums">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#55d949]" />
            <span className="text-text inline-block min-w-[1.5ch] text-left">
              {insideTotal}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-[#e45d5c]" />
            <span className="text-text inline-block min-w-[1.5ch] text-left">
              {outsideTotal}
            </span>
          </span>
        </div>

        <MonteCarloCanvas points={visiblePoints} fade={running} />
      </div>

      <div className="flex flex-col items-center gap-5">
        <div className="text-text flex items-baseline gap-1.5 text-4xl">
          <KatexMath math="\pi =" />
          <span className="inline-block w-[7ch] text-left tabular-nums">
            {estimateStr ? (
              <>
                {correctLength > 0 && (
                  <span className="rounded-[3px] bg-[#bdfab1] px-0.5">
                    {estimateStr.slice(0, correctLength)}
                  </span>
                )}
                {estimateStr.slice(correctLength)}
              </>
            ) : (
              <span className="text-text/40">&ndash;</span>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={total >= MAX_POINTS}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f59f01] text-2xl font-semibold text-white shadow-[0_6px_0_0_#bb7a02] transition-[transform,box-shadow] select-none hover:brightness-105 active:translate-y-[3px] active:shadow-[0_3px_0_0_#bb7a02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  )
}
