import { useMemo, useState } from 'react'

type Props = {
  expression?: string
}

const DEFAULT_EXPRESSION = '3 + 4 * (2 - 1)'

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
}
const RIGHT_ASSOCIATIVE = new Set(['^'])

function isOperator(token: string) {
  return token in PRECEDENCE
}

function tokenize(expression: string): string[] {
  return expression.replace(/\s+/g, '').match(/\d+(\.\d+)?|[+\-*/^()]/g) ?? []
}

// The Shunting-yard algorithm, condensed down to "infix tokens in, postfix
// tokens out" — this component treats it as an opaque black box and never
// surfaces the stack/queue mechanics that ShuntingYardWidget visualizes
// step-by-step elsewhere in this article.
function infixToPostfix(tokens: string[]): string[] {
  const output: string[] = []
  const stack: string[] = []

  for (const token of tokens) {
    if (token === '(') {
      stack.push(token)
    } else if (token === ')') {
      while (stack.length > 0 && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!)
      }
      stack.pop() // discard the matching "("
    } else if (isOperator(token)) {
      while (
        stack.length > 0 &&
        stack[stack.length - 1] !== '(' &&
        (PRECEDENCE[stack[stack.length - 1]] > PRECEDENCE[token] ||
          (PRECEDENCE[stack[stack.length - 1]] === PRECEDENCE[token] &&
            !RIGHT_ASSOCIATIVE.has(token)))
      ) {
        output.push(stack.pop()!)
      }
      stack.push(token)
    } else {
      output.push(token)
    }
  }

  while (stack.length > 0) {
    output.push(stack.pop()!)
  }

  return output
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
    case '^':
      return Math.pow(a, b)
    default:
      throw new Error(`Unknown operator: ${operator}`)
  }
}

// The postfix-evaluation black box: also condensed to a single result,
// since PostfixEvaluator elsewhere in this article already shows the
// stack-based mechanics in full.
function evaluatePostfix(tokens: string[]): number {
  const stack: number[] = []
  for (const token of tokens) {
    if (isOperator(token)) {
      const b = stack.pop()!
      const a = stack.pop()!
      stack.push(applyOperator(a, token, b))
    } else {
      stack.push(Number(token))
    }
  }
  return stack[0]
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2).replace(/\.?0+$/, '')
}

type TokenRowProps = {
  tokens: string[]
  revealed: boolean
  faded: boolean
}

function TokenRow({ tokens, revealed, faded }: TokenRowProps) {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-1.5">
      {tokens.map((token, index) =>
        revealed ? (
          <div
            key={index}
            className={`flex h-[31px] w-[34px] flex-none items-center justify-center rounded font-mono text-base font-semibold ${
              faded ? 'text-text/30' : 'text-text'
            }`}
          >
            {token}
          </div>
        ) : (
          <div
            key={index}
            className="border-text/15 h-[31px] w-[34px] flex-none rounded border border-dashed"
          />
        ),
      )}
    </div>
  )
}

type BlackBoxProps = {
  label: string
}

function BlackBox({ label }: BlackBoxProps) {
  return (
    <div className="bg-text text-bg rounded-[10px] px-6 py-4 text-sm font-bold">
      {label}
    </div>
  )
}

function Arrow() {
  return <span className="text-text/30 text-lg leading-none">↓</span>
}

// A higher-level "putting it all together" summary of the full pipeline:
// infix expression -> Shunting-yard -> postfix expression -> postfix
// evaluator -> answer. Unlike ShuntingYardWidget and PostfixEvaluator
// earlier in this article, this component deliberately does NOT visualize
// either algorithm's internal stack/queue mechanics token-by-token; the two
// algorithms are treated as opaque black boxes that each reveal one result.
export function FullPipelineWidget({ expression = DEFAULT_EXPRESSION }: Props) {
  const infixTokens = useMemo(() => tokenize(expression), [expression])
  const postfixTokens = useMemo(
    () => infixToPostfix(infixTokens),
    [infixTokens],
  )
  const answer = useMemo(() => evaluatePostfix(postfixTokens), [postfixTokens])

  // 0 = only infix shown, 1 = postfix revealed, 2 = answer revealed (done).
  const [step, setStep] = useState(0)

  const canReset = step > 0
  const canStep = step < 2

  function handleNext() {
    if (!canStep) return
    setStep((s) => s + 1)
  }

  function handleReset() {
    setStep(0)
  }

  return (
    <div className="not-prose bg-bg mx-auto flex w-full max-w-[520px] flex-col items-center gap-6 px-8 py-9">
      <div className="flex flex-col items-center gap-2">
        <span className="text-text/40 text-[11px] font-semibold tracking-wide uppercase">
          Infix
        </span>
        <TokenRow tokens={infixTokens} revealed faded={step !== 0} />
      </div>

      <Arrow />

      <BlackBox label="SHUNTING-YARD" />

      <Arrow />

      <div className="flex flex-col items-center gap-2">
        <span className="text-text/40 text-[11px] font-semibold tracking-wide uppercase">
          Postfix
        </span>
        <TokenRow
          tokens={postfixTokens}
          revealed={step >= 1}
          faded={step !== 1}
        />
      </div>

      <Arrow />

      <BlackBox label="POSTFIX EVALUATOR" />

      <Arrow />

      <div className="flex flex-col items-center gap-2">
        <span className="text-text/40 text-[11px] font-semibold tracking-wide uppercase">
          Answer
        </span>
        <div
          className={`flex h-[46px] w-16 items-center justify-center rounded-md ${
            step >= 2
              ? 'border-text border'
              : 'border-text/15 border border-dashed'
          }`}
        >
          {step >= 2 ? (
            <span className="text-text font-mono text-lg font-semibold">
              {formatNumber(answer)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-row gap-2">
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
