import { Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  initialCount?: number
}

type Phase = 'idle' | 'traveling' | 'processing'

type Point = { x: number; y: number }

// Waypoints (percentages of the diagram's bounding box) the message badge
// travels through: it appears under the View box, drops down to the bottom
// wire, slides left along it, then rises into the Update box.
const PATH: Point[] = [
  { x: 73.8, y: 80.3 },
  { x: 73.8, y: 86.9 },
  { x: 24.4, y: 86.9 },
  { x: 24.4, y: 69 },
]

export function ElmArchitectureExplainer({ initialCount = 0 }: Props) {
  const [count, setCount] = useState(initialCount)
  const [phase, setPhase] = useState<Phase>('idle')
  const [pathIndex, setPathIndex] = useState(0)
  const [message, setMessage] = useState('')
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  function schedule(fn: () => void, delay: number) {
    timeoutsRef.current.push(window.setTimeout(fn, delay))
  }

  function send(label: string, delta: number) {
    if (phase !== 'idle') return

    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []

    setMessage(label)
    setPathIndex(0)
    setPhase('traveling')

    schedule(() => setPathIndex(1), 50)
    schedule(() => setPathIndex(2), 600)
    schedule(() => setPathIndex(3), 1250)
    schedule(() => setPhase('processing'), 1800)
    schedule(() => {
      setCount((c) => c + delta)
      setPhase('idle')
    }, 2600)
  }

  function handleReset() {
    if (phase !== 'idle') return
    setCount(0)
  }

  const disabled = phase !== 'idle'
  const pos = PATH[pathIndex]

  return (
    <div className="not-prose bg-bg my-6">
      <div className="[container-type:inline-size] relative mx-auto aspect-[1000/580] w-full max-w-2xl">
        {/* Wires connecting Model -> View -> Update -> Model */}
        <div className="bg-text/15 absolute top-[12.9%] left-[23.6%] h-[4.7%] w-px" />
        <div className="bg-text/15 absolute top-[12.9%] left-[23.5%] h-px w-[51.1%]" />
        <div className="bg-text/15 absolute top-[12.9%] left-[74.6%] h-[7.8%] w-px" />
        <div className="bg-text/15 absolute top-[42.4%] left-[24.4%] h-[31.2%] w-px" />
        <div className="bg-text/15 absolute top-[73.8%] left-[73.7%] h-[13.2%] w-px" />
        <div className="bg-text/15 absolute top-[86.9%] left-[24.3%] h-px w-[49.7%]" />
        <div className="bg-text/15 absolute top-[76.9%] left-[24.4%] h-[10.1%] w-px" />

        {/* Model */}
        <div className="border-text/70 bg-bg absolute top-[17.6%] left-[12.8%] flex h-[24.9%] w-[21.7%] flex-col items-center justify-center gap-[1%] rounded-full border">
          <span className="text-text/40 text-[1.1cqw] font-bold tracking-widest uppercase">
            Model
          </span>
          <span className="text-text text-[1.7cqw]">count: {count}</span>
        </div>

        {/* Update */}
        <div className="border-text/70 bg-bg absolute top-[61.4%] left-[15.3%] flex h-[15.6%] w-[18.4%] flex-col items-center justify-center gap-[1%] rounded-[1.4cqw] border">
          <span className="text-text/40 text-[1.1cqw] font-bold tracking-widest uppercase">
            Update
          </span>
          <span className="text-text text-[1.5cqw]">—</span>
        </div>
        <div className="text-text absolute top-[58.7%] left-[33.2%] flex h-[5.3%] w-[3.1%] items-center justify-center">
          <Settings
            className={`h-full w-full ${phase === 'processing' ? 'animate-spin' : ''}`}
            strokeWidth={2}
          />
        </div>

        {/* View */}
        <div className="border-text bg-bg absolute top-[20.7%] left-[62.1%] flex h-[52.9%] w-[25.1%] flex-col items-center gap-[1.5%] rounded-[2cqw] border-2 pt-[4%] pb-[3%]">
          <span className="text-text/40 text-[1.1cqw] font-bold tracking-widest uppercase">
            View
          </span>
          <span className="text-text/40 text-[1.4cqw]">Counter</span>
          <span className="text-text flex flex-1 items-center text-[5.6cqw] font-bold">
            {count}
          </span>
          <div className="flex items-center gap-[2%]">
            <button
              type="button"
              onClick={() => send('DECREMENT', -1)}
              disabled={disabled}
              aria-label="Decrement"
              className="border-text/15 bg-bg text-text hover:bg-text/5 flex h-[5cqw] w-[5cqw] items-center justify-center rounded-[1cqw] border text-[2.2cqw] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => send('INCREMENT', 1)}
              disabled={disabled}
              aria-label="Increment"
              className="bg-text text-bg hover:bg-text/90 flex h-[5cqw] w-[5cqw] items-center justify-center rounded-[1cqw] text-[2.2cqw] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled}
            className="text-text/40 hover:text-text text-[1.3cqw] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset
          </button>
        </div>

        {/* Traveling message badge; stays put at the Update box while processing */}
        {(phase === 'traveling' || phase === 'processing') && (
          <div
            className="bg-text text-bg absolute flex h-[5.5%] w-[9.6%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[1.2cqw] font-bold tracking-wide uppercase transition-[left,top] duration-500 ease-in-out"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
