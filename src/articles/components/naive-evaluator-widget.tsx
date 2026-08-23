import { useMemo, useState } from 'react'

type Props = {
  expression?: string
}

const DEFAULT_EXPRESSION = '3+5-2'

const OPERATORS = new Set(['+', '-', '*', '/'])

type Token = number | string

function tokenize(expression: string): Token[] {
  const matches =
    expression.replace(/\s+/g, '').match(/\d+(\.\d+)?|[+\-*/]/g) ?? []
  return matches.map((match) => (OPERATORS.has(match) ? match : Number(match)))
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

// Plain, precedence-unaware left-to-right evaluation: combine the running
// total with the next operator/operand pair, one pair at a time. This is
// intentionally "naive" - it never gives division or multiplication
// priority over addition/subtraction, which is exactly the bug this widget
// is meant to illustrate.
export function NaiveEvaluatorWidget({
  expression = DEFAULT_EXPRESSION,
}: Props) {
  const tokens = useMemo(() => tokenize(expression), [expression])
  const operationCount = Math.max(0, Math.floor((tokens.length - 1) / 2))

  // Number of operations already applied (0 = nothing combined yet).
  const [step, setStep] = useState(0)

  const done = step >= operationCount
  const displayStep = Math.min(step + 1, Math.max(operationCount, 1))

  const accumulator = useMemo(() => {
    let acc = tokens[0] as number
    for (let i = 0; i < step; i++) {
      const operator = tokens[1 + i * 2] as string
      const operand = tokens[2 + i * 2] as number
      acc = applyOperator(acc, operator, operand)
    }
    return acc
  }, [tokens, step])

  const operatorIndex = 2 * step + 1
  const operandIndex = 2 * step + 2
  const currentOperator = !done ? (tokens[operatorIndex] as string) : null
  const currentOperand = !done ? (tokens[operandIndex] as number) : null
  const trailingTokens = !done ? tokens.slice(operandIndex + 1) : []

  const canReset = step > 0
  const canStep = !done

  function handleNext() {
    if (!canStep) return
    setStep((s) => s + 1)
  }

  function handleReset() {
    setStep(0)
  }

  return (
    <div className="not-prose bg-bg mx-auto my-6 w-full max-w-[560px] px-8 pt-8 pb-10">
      <div className="text-text/40 text-right text-xs font-semibold">
        step {displayStep} / {Math.max(operationCount, 1)}
      </div>

      <div className="mt-10 flex min-h-11 items-center justify-center gap-2">
        <span className="bg-text text-bg rounded-[10px] px-5 py-2 text-lg font-bold">
          {formatNumber(accumulator)}
        </span>
        {!done && (
          <>
            <span className="bg-text/10 text-text rounded-[10px] px-4 py-2 text-lg font-bold">
              {currentOperator}
            </span>
            <span className="bg-text/10 text-text rounded-[10px] px-4 py-2 text-lg font-bold">
              {formatNumber(currentOperand as number)}
            </span>
            {trailingTokens.map((token, index) => (
              <span key={index} className="text-text px-1 text-lg font-bold">
                {typeof token === 'number' ? formatNumber(token) : token}
              </span>
            ))}
          </>
        )}
      </div>

      <div className="border-text/10 mt-4 border-t" />

      <div className="mt-[30px] flex items-center gap-[15px]">
        <button
          type="button"
          onClick={handleReset}
          disabled={!canReset}
          className="border-text/10 text-text hover:bg-text/5 rounded-[10px] border px-[22px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canStep}
          className="bg-text text-bg hover:bg-text/90 rounded-[10px] px-[22px] py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next Step
        </button>
      </div>
    </div>
  )
}
