import { Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type StackItem = {
  id: number
  value: number
}

type Props = {
  initialItems?: number[]
  initialPopped?: number | null
  maxItems?: number
}

type Toast = {
  message: string
} | null

const BOX_HEIGHT = 52
const BOX_GAP = 8
const LABEL_HEIGHT = 12
const LABEL_GAP = 4
const TOAST_DURATION = 1800
const PEEK_PULSE_DURATION = 600

function randomValue(): number {
  return Math.floor(Math.random() * 98) + 1
}

let idCounter = 0
function nextId(): number {
  idCounter += 1
  return idCounter
}

function toItems(values: number[]): StackItem[] {
  return values.map((value) => ({ id: nextId(), value }))
}

// Items are stored bottom-first (index 0 = first item pushed, sitting at the
// base of the stack) and rendered top-first, so the most recently pushed
// item always appears at the top of the visual stack (LIFO).
export function StackVisualizer({
  initialItems = [],
  initialPopped = null,
  maxItems = 4,
}: Props) {
  const [items, setItems] = useState<StackItem[]>(() => toItems(initialItems))
  const [popped, setPopped] = useState<number | null>(initialPopped)
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

  const isFull = items.length >= maxItems
  const isEmpty = items.length === 0

  // The stack grows from the bottom up: reserve enough height for the
  // maximum number of items so the widget's footprint never changes, and
  // anchor the current items to the bottom of that space.
  const stackAreaHeight =
    LABEL_HEIGHT + LABEL_GAP + maxItems * BOX_HEIGHT + (maxItems - 1) * BOX_GAP

  function showToast(message: string) {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current)
    setToast({ message })
    toastTimeoutRef.current = window.setTimeout(
      () => setToast(null),
      TOAST_DURATION,
    )
  }

  function handlePush() {
    if (isFull) return
    setItems((prev) => [...prev, { id: nextId(), value: randomValue() }])
  }

  function handlePop() {
    if (isEmpty) return
    const top = items[items.length - 1]
    setItems((prev) => prev.slice(0, -1))
    setPopped(top.value)
  }

  function handlePeek() {
    if (isEmpty) return
    showToast(`Top is ${items[items.length - 1].value}`)
    setPeeking(true)
    if (peekTimeoutRef.current) window.clearTimeout(peekTimeoutRef.current)
    peekTimeoutRef.current = window.setTimeout(
      () => setPeeking(false),
      PEEK_PULSE_DURATION,
    )
  }

  const topToBottom = [...items].reverse()

  return (
    <div className="not-prose bg-bg mx-auto my-6 flex w-full max-w-[360px] flex-col items-center gap-6 px-6 py-8">
      {/* Reserved-height toast so feedback never shifts the layout below it */}
      <div
        className="text-text/70 flex min-h-5 items-center justify-center text-center text-sm font-medium"
        aria-live="polite"
      >
        {toast?.message ?? ' '}
      </div>

      <div
        className="flex w-[172px] flex-col items-center justify-end gap-1"
        style={{ height: stackAreaHeight }}
      >
        <span
          className={`text-text text-[10px] font-semibold tracking-[1px] uppercase transition-opacity ${
            isEmpty ? 'opacity-0' : 'opacity-100'
          }`}
        >
          top
        </span>
        <div className="flex w-[152px] flex-col items-center gap-2">
          {topToBottom.map((item, index) => (
            <div
              key={item.id}
              className={`flex h-[52px] w-full items-center justify-center rounded-[10px] transition-transform duration-300 ${
                index === 0
                  ? `border-text border-[1.5px] ${peeking ? 'scale-105' : 'scale-100'}`
                  : 'border-text/10 border'
              }`}
            >
              <span className="text-text font-mono text-[17px] font-semibold">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-text/10 h-[3px] w-[172px] rounded-full" />

      <span className="text-text/40 text-[11px] font-semibold uppercase">
        stack
      </span>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handlePush}
          disabled={isFull}
          aria-label="Push a random value onto the stack"
          className="bg-text text-bg hover:bg-text/90 rounded-lg px-[22px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Push
        </button>
        <button
          type="button"
          onClick={handlePop}
          disabled={isEmpty}
          aria-label="Pop the top value off the stack"
          className="border-text/10 text-text hover:bg-text/5 rounded-lg border px-[22px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pop
        </button>
        <button
          type="button"
          onClick={handlePeek}
          disabled={isEmpty}
          aria-label="Peek at the top value of the stack"
          className="border-text/10 text-text hover:bg-text/5 flex items-center gap-1.5 rounded-lg border px-[22px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Eye size={14} strokeWidth={2} />
          Peek
        </button>
      </div>

      <div className="flex min-h-[15px] items-center gap-1 text-[13px]">
        <span className="text-text/40">Popped:</span>
        <span className="text-text font-semibold">{popped ?? '—'}</span>
      </div>
    </div>
  )
}
