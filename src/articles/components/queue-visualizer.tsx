import { ArrowRight, Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  initialQueue?: number[]
  maxCapacity?: number
}

type Toast = {
  message: string
} | null

const DEFAULT_QUEUE: number[] = []
const DEFAULT_MAX_CAPACITY = 5
const TOAST_DURATION = 1800
const PEEK_PULSE_DURATION = 600
const SLOT_SIZE = 64
const SLOT_GAP = 8
const CARD_HORIZONTAL_PADDING = 64

function randomValue(): number {
  return Math.floor(Math.random() * 90) + 10
}

export function QueueVisualizer({
  initialQueue = DEFAULT_QUEUE,
  maxCapacity = DEFAULT_MAX_CAPACITY,
}: Props) {
  const [queue, setQueue] = useState<number[]>(initialQueue.slice(-maxCapacity))
  const [lastDequeued, setLastDequeued] = useState<number | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const [peeking, setPeeking] = useState(false)
  const toastTimeoutRef = useRef<number | null>(null)
  const peekTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current)
      if (peekTimeoutRef.current) window.clearTimeout(peekTimeoutRef.current)
    }
  }, [])

  function showToast(message: string) {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current)
    setToast({ message })
    toastTimeoutRef.current = window.setTimeout(
      () => setToast(null),
      TOAST_DURATION,
    )
  }

  const canEnqueue = queue.length < maxCapacity
  const canDequeueOrPeek = queue.length > 0

  function handleEnqueue() {
    if (!canEnqueue) return
    const value = randomValue()
    setQueue((q) => [...q, value])
    showToast(`Enqueued ${value} at the back`)
  }

  function handleDequeue() {
    if (!canDequeueOrPeek) return
    const front = queue[0]
    setQueue((q) => q.slice(1))
    setLastDequeued(front)
    showToast(`Dequeued ${front} from the front`)
  }

  function handlePeek() {
    if (!canDequeueOrPeek) return
    showToast(`Front is ${queue[0]}`)
    setPeeking(true)
    if (peekTimeoutRef.current) window.clearTimeout(peekTimeoutRef.current)
    peekTimeoutRef.current = window.setTimeout(
      () => setPeeking(false),
      PEEK_PULSE_DURATION,
    )
  }

  // Render a fixed number of slots so the widget's footprint never changes
  // as items are enqueued/dequeued. Items flow from back (left) to front
  // (right) and stay anchored to the front end, with empty slots reserved
  // on the back side - mirroring the board's right-aligned layout.
  const slots: (number | null)[] = Array(maxCapacity).fill(null)
  const backToFront = [...queue].reverse()
  const startIndex = maxCapacity - backToFront.length
  backToFront.forEach((value, i) => {
    slots[startIndex + i] = value
  })
  const frontSlotIndex = queue.length > 0 ? maxCapacity - 1 : -1

  // Size the card to hug exactly `maxCapacity` slots, so the track never
  // implies room for more items than it actually holds.
  const trackWidth = maxCapacity * SLOT_SIZE + (maxCapacity - 1) * SLOT_GAP

  return (
    <div
      className="not-prose bg-bg mx-auto my-6 flex w-full flex-col gap-4 px-6 py-8 sm:px-8"
      style={{ maxWidth: trackWidth + CARD_HORIZONTAL_PADDING }}
    >
      {/* Reserved-height toast so feedback never shifts the layout below it */}
      <div
        className="text-text/70 flex min-h-5 items-center justify-center text-center text-sm font-medium"
        aria-live="polite"
      >
        {toast?.message ?? ' '}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-text/40 text-[11px] font-semibold tracking-wide uppercase">
          End
        </span>
        <span className="text-text/40 flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase">
          flow
          <ArrowRight size={11} strokeWidth={2.5} />
        </span>
        <span className="text-text text-[11px] font-semibold tracking-wide uppercase">
          Front
        </span>
      </div>

      <div className="flex justify-end gap-2">
        {slots.map((value, index) => {
          const isFront = index === frontSlotIndex
          return (
            <div
              key={index}
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-md border font-mono text-lg font-semibold transition-transform duration-300 ${
                value === null
                  ? 'border-text/10 text-text/20 border-dashed'
                  : isFront
                    ? `border-text text-text ${peeking ? 'scale-105' : 'scale-100'}`
                    : 'border-text/10 text-text'
              }`}
            >
              {value ?? ''}
            </div>
          )
        })}
      </div>

      <div className="bg-text/10 h-px w-full" />

      <div className="text-text/40 text-center text-[11px] font-semibold tracking-wide uppercase">
        Queue
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleEnqueue}
          disabled={!canEnqueue}
          className="bg-text text-bg hover:bg-text/90 rounded-md px-[18px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Enqueue
        </button>
        <button
          type="button"
          onClick={handleDequeue}
          disabled={!canDequeueOrPeek}
          className="border-text text-text hover:bg-text/5 rounded-md border px-[18px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Dequeue
        </button>
        <button
          type="button"
          onClick={handlePeek}
          disabled={!canDequeueOrPeek}
          className="border-text/15 text-text hover:bg-text/5 flex items-center gap-1.5 rounded-md border px-[18px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Eye size={14} strokeWidth={2} />
          Peek
        </button>
        <div className="text-text/40 flex items-center gap-1 text-sm">
          Dequeued:{' '}
          <span className="text-text font-semibold">{lastDequeued ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}
