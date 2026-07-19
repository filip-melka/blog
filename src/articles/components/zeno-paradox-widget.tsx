import { GlassWater, User } from 'lucide-react'
import { useState } from 'react'

type Props = {
  maxSteps?: number
}

const DEFAULT_MAX_STEPS = 10

function formatRemaining(steps: number): string {
  if (steps === 0) return '1 m'
  return `1/${2 ** steps} m`
}

export function ZenoParadoxWidget({ maxSteps = DEFAULT_MAX_STEPS }: Props) {
  const [steps, setSteps] = useState(0)
  const [atInfinity, setAtInfinity] = useState(false)

  // Fraction of the total distance Zeno has covered so far. Taking a step
  // always halves whatever distance remains, so it asymptotically
  // approaches - but by construction never reaches - 1. Only "Skip to
  // infinity" sets it to exactly 1, dramatizing the geometric series' limit.
  const covered = atInfinity ? 1 : 1 - 1 / 2 ** steps
  const remainingLabel = atInfinity ? '0 m' : formatRemaining(steps)
  // The remaining-distance label sits under the midpoint of the untravelled
  // segment, i.e. halfway between Zeno's current position and the cup.
  const midpoint = (covered + 1) / 2

  const canStep = !atInfinity && steps < maxSteps
  const canSkip = !atInfinity
  const canReset = steps > 0 || atInfinity

  function handleStep() {
    if (!canStep) return
    setSteps((s) => s + 1)
  }

  function handleSkip() {
    if (!canSkip) return
    setAtInfinity(true)
  }

  function handleReset() {
    setSteps(0)
    setAtInfinity(false)
  }

  return (
    <div className="not-prose bg-bg mx-auto my-6 flex w-full max-w-[640px] flex-col gap-7 px-8 py-9">
      <div className="relative h-[104px] w-full">
        {/* Zeno - moves halfway toward the cup with every step, and fades
            into the cup once we skip to the (unreachable-by-finite-steps)
            infinite limit. */}
        <div
          className="absolute top-0 flex w-max -translate-x-1/2 flex-col items-center transition-[left,opacity] duration-700 ease-in-out"
          style={{ left: `${covered * 100}%`, opacity: atInfinity ? 0 : 1 }}
        >
          <User className="text-text/50" size={20} strokeWidth={1.75} />
        </div>
        <div
          className="text-text/50 absolute top-[62px] -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap transition-[left,opacity] duration-700 ease-in-out"
          style={{ left: `${covered * 100}%`, opacity: atInfinity ? 0 : 1 }}
        >
          Zeno
        </div>

        {/* The cup - fixed at the far end of the track, the goal Zeno's
            reasoning says he can never actually reach. */}
        <div className="absolute top-0 right-0 flex w-max translate-x-1/2 flex-col items-center">
          <GlassWater className="text-text/50" size={20} strokeWidth={1.75} />
        </div>
        <div className="text-text/50 absolute top-[62px] right-0 translate-x-1/2 text-[11px] font-semibold whitespace-nowrap">
          The cup
        </div>

        {/* Track: baseline is the full distance, fill is the distance
            already covered. */}
        <div className="bg-text/10 absolute top-11 h-2 w-full rounded-full" />
        <div
          className="bg-text absolute top-11 h-2 rounded-full transition-[width] duration-700 ease-in-out"
          style={{ width: `${covered * 100}%` }}
        />
        <div className="bg-text absolute top-[39px] left-0 h-[18px] w-[18px] rounded-full" />
        <div className="bg-text absolute top-[39px] right-0 h-[18px] w-[18px] rounded-full" />

        {/* Remaining distance, as a fraction of the total 1m walk. */}
        <div
          className="text-text absolute top-21 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap transition-[left] duration-700 ease-in-out"
          style={{ left: `${midpoint * 100}%` }}
        >
          {remainingLabel}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleStep}
          disabled={!canStep}
          className="bg-text text-bg hover:bg-text/90 rounded-lg px-[22px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Take a step
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={!canSkip}
          className="border-text/15 text-text hover:bg-text/5 rounded-lg border px-[22px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Skip to infinity
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!canReset}
          className="text-text/40 hover:text-text disabled:hover:text-text/40 rounded-lg px-[22px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
