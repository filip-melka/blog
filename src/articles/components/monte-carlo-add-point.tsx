import { useRef, useState } from 'react'

import { MonteCarloCanvas } from './monte-carlo-canvas'
import type { Point } from './monte-carlo-shared'
import { MAX_POINTS, randomPoint } from './monte-carlo-shared'

export function MonteCarloAddPoint() {
  const [points, setPoints] = useState<Point[]>([])
  const nextIdRef = useRef(0)

  function addPoint() {
    setPoints((prev) => {
      if (prev.length >= MAX_POINTS) return prev
      return [...prev, randomPoint(nextIdRef.current++)]
    })
  }

  return (
    <div className="not-prose bg-bg mx-auto my-6 flex w-fit flex-col items-center gap-6 px-8 py-9 sm:flex-row sm:gap-12">
      <MonteCarloCanvas points={points} />
      <button
        type="button"
        onClick={addPoint}
        disabled={points.length >= MAX_POINTS}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f59f01] text-2xl font-semibold text-white shadow-[0_6px_0_0_#bb7a02] transition-[transform,box-shadow] select-none hover:brightness-105 active:translate-y-[3px] active:shadow-[0_3px_0_0_#bb7a02] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add
      </button>
    </div>
  )
}
