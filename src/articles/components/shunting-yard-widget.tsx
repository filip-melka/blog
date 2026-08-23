import { useMemo, useState } from 'react'

type Props = {
  /**
   * The infix expression to convert, given as an already-tokenized list
   * (each element is one token: a number, an operator, or a bracket).
   */
  tokens?: string[]
}

type Step = {
  /** Operator stack, bottom of stack first, top of stack last. */
  stack: string[]
  /** Output queue, oldest (back) first, newest (front) last. */
  queue: string[]
  /** Index of the token currently being read, or null before the first step. */
  activeTokenIndex: number | null
  caption: string
}

const DEFAULT_TOKENS = ['3', '+', '4', '*', '(', '2', '-', '1', ')']

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
}
const RIGHT_ASSOCIATIVE = new Set(['^'])

const STACK_ITEM_HEIGHT = 52
const STACK_GAP = 8

function isOperator(token: string) {
  return token in PRECEDENCE
}

function buildSteps(tokens: string[]): Step[] {
  const steps: Step[] = []
  const stack: string[] = []
  const queue: string[] = []

  steps.push({
    stack: [],
    queue: [],
    activeTokenIndex: null,
    caption: 'Click "Next Step" to start converting infix to postfix.',
  })

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    let caption = ''

    if (token === '(') {
      stack.push(token)
      caption = '"(" is a left bracket, so push it onto the stack.'
    } else if (token === ')') {
      const popped: string[] = []
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        const op = stack.pop()!
        popped.push(op)
        queue.push(op)
      }
      stack.pop() // discard the matching "("
      caption =
        popped.length > 0
          ? `")" → pop back to the matching "(", sending "${popped.join(', ')}" to the queue and discarding both parentheses.`
          : '")" → pop back to the matching "(" (no operators in between) and discard both parentheses.'
    } else if (isOperator(token)) {
      const popped: string[] = []
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        (PRECEDENCE[stack[stack.length - 1]] > PRECEDENCE[token] ||
          (PRECEDENCE[stack[stack.length - 1]] === PRECEDENCE[token] &&
            !RIGHT_ASSOCIATIVE.has(token)))
      ) {
        const op = stack.pop()!
        popped.push(op)
        queue.push(op)
      }
      stack.push(token)
      caption =
        popped.length > 0
          ? `"${token}" pops "${popped.join(', ')}" to the queue (equal or higher precedence), then gets pushed onto the stack.`
          : `"${token}" has nothing to pop before it, so it gets pushed onto the stack.`
    } else {
      queue.push(token)
      caption = `"${token}" is a number, so it goes straight into the queue.`
    }

    steps.push({
      stack: [...stack],
      queue: [...queue],
      activeTokenIndex: i,
      caption,
    })
  }

  if (stack.length > 0) {
    const popped: string[] = []
    while (stack.length > 0) {
      const op = stack.pop()!
      popped.push(op)
      queue.push(op)
    }
    steps.push({
      stack: [],
      queue: [...queue],
      activeTokenIndex: tokens.length,
      caption: `No tokens left → pop the remaining operator${popped.length > 1 ? 's' : ''} "${popped.join(', ')}" from the stack onto the queue. Postfix result: ${queue.join(' ')}`,
    })
  } else {
    steps.push({
      stack: [],
      queue: [...queue],
      activeTokenIndex: tokens.length,
      caption: `No tokens left and the stack is already empty. Postfix result: ${queue.join(' ')}`,
    })
  }

  return steps
}

type StackSlotProps = {
  token: string
  isTop: boolean
}

function StackSlot({ token, isTop }: StackSlotProps) {
  if (token === '(') {
    return (
      <div className="flex h-[52px] w-full flex-none items-center justify-center">
        <div
          className={`bg-text flex h-[38px] w-[38px] rotate-45 items-center justify-center rounded-[9px] ${
            isTop ? 'outline-text outline-2 outline-offset-2' : ''
          }`}
        >
          <span className="text-bg -rotate-45 font-mono text-lg font-semibold">
            (
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`text-text flex h-[52px] w-full flex-none items-center justify-center rounded-[10px] border font-mono text-[17px] font-semibold ${
        isTop ? 'border-text border-[1.5px]' : 'border-text/15'
      }`}
    >
      {token}
    </div>
  )
}

export function ShuntingYardWidget({ tokens = DEFAULT_TOKENS }: Props) {
  const steps = useMemo(() => buildSteps(tokens), [tokens])
  const [stepIndex, setStepIndex] = useState(0)

  const maxStackDepth = useMemo(
    () => Math.max(1, ...steps.map((s) => s.stack.length)),
    [steps],
  )
  const maxQueueLength = useMemo(
    () => Math.max(1, ...steps.map((s) => s.queue.length)),
    [steps],
  )

  const step = steps[stepIndex]
  const isDone = stepIndex === steps.length - 1
  const stackMinHeight =
    maxStackDepth * STACK_ITEM_HEIGHT + (maxStackDepth - 1) * STACK_GAP

  function handleNext() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }

  function handleReset() {
    setStepIndex(0)
  }

  return (
    <div className="not-prose bg-bg mx-auto flex w-full max-w-[560px] flex-col gap-7 overflow-x-hidden px-6 py-8 sm:px-7">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-row flex-wrap gap-1.5">
          {tokens.map((token, i) => {
            const isPast =
              step.activeTokenIndex !== null && i < step.activeTokenIndex
            const isActive = i === step.activeTokenIndex
            return (
              <div
                key={i}
                className={`flex h-[31px] w-[34px] flex-none items-center justify-center rounded font-mono text-base font-semibold ${
                  isActive
                    ? 'bg-text text-bg'
                    : isPast
                      ? 'text-text/30'
                      : 'text-text'
                }`}
              >
                {token}
              </div>
            )
          })}
        </div>
        <p className="text-text/50 min-h-10 text-sm">{step.caption}</p>
      </div>

      <div className="bg-text/10 h-px w-full" />

      <div className="flex flex-row flex-wrap gap-5">
        <div className="border-text/10 flex min-w-0 flex-col gap-3.5 rounded-xl border p-5">
          <h3 className="text-text text-base font-semibold">Operator Stack</h3>
          <div
            className="flex w-32 flex-col justify-end gap-2"
            style={{ minHeight: stackMinHeight }}
          >
            {[...step.stack].reverse().map((token, idx) => (
              <StackSlot key={idx} token={token} isTop={idx === 0} />
            ))}
          </div>
        </div>

        <div className="border-text/10 flex min-w-0 flex-col gap-3.5 rounded-xl border p-5">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-text text-base font-semibold">Output Queue</h3>
            <div className="flex flex-row items-center justify-between text-[11px] font-semibold tracking-wide">
              <span className="text-text/40">BACK</span>
              <span className="text-text">FRONT</span>
            </div>
          </div>
          <div className="flex flex-row gap-2 overflow-x-auto">
            {(() => {
              // The first token ever enqueued is the front of the queue and
              // must stay pinned to the rightmost slot; reserve any unused
              // capacity on the back (left) side instead, mirroring the
              // standalone QueueVisualizer's layout.
              const backToFront = [...step.queue].reverse()
              const startIndex = maxQueueLength - backToFront.length

              return Array.from({ length: maxQueueLength }).map((_, i) => {
                const token =
                  i >= startIndex ? backToFront[i - startIndex] : undefined
                const isFront =
                  step.queue.length > 0 && i === maxQueueLength - 1

                if (token === undefined) {
                  return (
                    <div
                      key={i}
                      className="border-text/15 h-12 w-12 flex-none rounded-md border border-dashed"
                    />
                  )
                }

                return (
                  <div
                    key={i}
                    className={`text-text flex h-12 w-12 flex-none items-center justify-center rounded-md border font-mono text-base font-semibold ${
                      isFront ? 'border-text border-[1.5px]' : 'border-text/15'
                    }`}
                  >
                    {token}
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="border-text/20 bg-bg text-text hover:bg-text/5 rounded-md border px-4 py-1 text-sm font-semibold transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isDone}
          className="bg-text text-bg rounded-md px-4 py-1 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}
