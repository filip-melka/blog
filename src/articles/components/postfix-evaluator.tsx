import { useMemo, useState } from 'react'

type Props = {
  expression?: string
}

const DEFAULT_EXPRESSION = '5 1 2 + 4 * + 3 -'

const OPERATORS = new Set(['+', '-', '*', '/'])

type Token = { raw: string; isOperator: boolean }

function tokenize(expression: string): Token[] {
  return expression
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => ({ raw, isOperator: OPERATORS.has(raw) }))
}

function applyOperator(a: number, operator: string, b: number): number {
  switch (operator) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '*':
      return a * b
    case '/':
      return a / b
    default:
      throw new Error(`Unknown operator: ${operator}`)
  }
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2).replace(/\.?0+$/, '')
}

type SimulationStep = {
  // Stack contents right after this token has been processed, top last.
  stack: number[]
  // Set only for operator tokens: the two popped operands and the result
  // that got pushed back on.
  operation: { a: number; b: number; result: number } | null
}

// Run the whole expression ahead of time. This tells us the maximum stack
// depth the widget will ever need to display, so we can reserve a fixed
// number of stack slots up front and keep the widget's footprint constant
// across every step, instead of growing/shrinking as the reader steps
// through the expression.
function simulate(tokens: Token[]): SimulationStep[] {
  const steps: SimulationStep[] = []
  let stack: number[] = []
  for (const token of tokens) {
    let operation: SimulationStep['operation'] = null
    if (token.isOperator) {
      const b = stack[stack.length - 1]
      const a = stack[stack.length - 2]
      const result = applyOperator(a, token.raw, b)
      stack = [...stack.slice(0, -2), result]
      operation = { a, b, result }
    } else {
      stack = [...stack, Number(token.raw)]
    }
    steps.push({ stack, operation })
  }
  return steps
}

// Stack & Queue In A Nutshell: evaluating a postfix (Reverse Polish
// Notation) expression with a single left-to-right pass and a single
// stack. Numbers get pushed as they're read; operators pop the operands
// they need (the first one popped is the right-hand operand), apply
// themselves, and push the result back on. Once every token has been
// read, the one value left on the stack is the answer.
export function PostfixEvaluator({ expression = DEFAULT_EXPRESSION }: Props) {
  const tokens = useMemo(() => tokenize(expression), [expression])
  const steps = useMemo(() => simulate(tokens), [tokens])
  const maxDepth = useMemo(
    () => Math.max(1, ...steps.map((step) => step.stack.length)),
    [steps],
  )

  // -1 = nothing processed yet.
  const [step, setStep] = useState(-1)

  const canStep = step < tokens.length - 1
  const canReset = step >= 0
  const done = step >= 0 && !canStep

  const current = step >= 0 ? steps[step] : null
  const currentToken = step >= 0 ? tokens[step] : null
  const stack = current?.stack ?? []
  const answer = stack[0]

  function handleNext() {
    if (!canStep) return
    setStep((s) => s + 1)
  }

  function handleReset() {
    setStep(-1)
  }

  let message: string
  if (!currentToken) {
    message = 'Click "Next Step" to begin evaluating.'
  } else if (currentToken.isOperator && current?.operation) {
    const { a, b, result } = current.operation
    message = `Read "${currentToken.raw}": pop ${formatNumber(b)} and ${formatNumber(a)}, compute ${formatNumber(a)} ${currentToken.raw} ${formatNumber(b)} = ${formatNumber(result)}, push ${formatNumber(result)}.`
  } else {
    message = `Push ${currentToken.raw} onto the stack.`
  }
  if (done) {
    message += ` Final answer: ${formatNumber(answer)}.`
  }

  // Render the stack with the top item first, padded with empty
  // placeholder slots reserved above it up to the pre-computed maximum
  // depth. This keeps the stack's visual footprint constant no matter how
  // deep it currently is, and anchors real items to the bottom of the
  // column so the stack grows upward as items are pushed, matching the
  // stack's bottom-up mental model.
  const topFirst = [...stack].reverse()
  const padCount = Math.max(0, maxDepth - topFirst.length)
  const slots: (number | null)[] = [...Array(padCount).fill(null), ...topFirst]
  const topOfStackIndex = topFirst.length > 0 ? padCount : -1

  return (
    <div className="not-prose bg-bg mx-auto my-6 flex w-full max-w-[520px] flex-col items-center gap-7 px-8 py-9">
      <div className="flex w-full flex-nowrap items-center justify-center gap-1.5 overflow-x-auto">
        {tokens.map((token, index) => {
          const isPast = step >= 0 && index < step
          const isCurrent = index === step
          return (
            <span
              key={index}
              className={`rounded px-3 py-1.5 font-mono text-base font-semibold whitespace-pre ${
                isCurrent
                  ? 'bg-text text-bg'
                  : isPast
                    ? 'text-text/30'
                    : 'text-text'
              }`}
            >
              {token.raw}
            </span>
          )
        })}
      </div>

      <div className="border-text/10 w-full border-t" />

      <div className="flex w-full flex-col items-center gap-2.5">
        <div className="flex h-[30px] items-center justify-center">
          <span
            className={`bg-text/5 border-text/10 text-text rounded-md border px-3.5 py-1.5 font-mono text-[15px] font-semibold ${
              current?.operation ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {current?.operation
              ? `${formatNumber(current.operation.a)} ${currentToken?.raw} ${formatNumber(current.operation.b)} = ${formatNumber(current.operation.result)}`
              : ' '}
          </span>
        </div>

        <div className="flex w-20 flex-col">
          {slots.map((value, index) => (
            <div
              key={index}
              className={`flex h-[46px] items-center justify-center rounded-md font-mono text-lg font-semibold ${
                value === null
                  ? 'border-text/15 border border-dashed'
                  : index === topOfStackIndex
                    ? 'bg-bg border-text border'
                    : 'bg-bg border-text/10 border'
              }`}
            >
              {value !== null ? (
                <span className="text-text">{formatNumber(value)}</span>
              ) : null}
            </div>
          ))}
        </div>

        <span className="text-text/40 text-[11px] font-semibold tracking-wide uppercase">
          Stack
        </span>
      </div>

      <p className="text-text/70 min-h-10 text-center text-sm leading-5">
        {message}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleReset}
          disabled={!canReset}
          className="border-text/10 text-text hover:bg-text/5 rounded-md border px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canStep}
          className="bg-text text-bg hover:bg-text/90 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}
