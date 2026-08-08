import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'

type Step = {
  title: string
  description: string
}

const STEPS: Step[] = [
  { title: 'You', description: 'Pick a name and a TLD (.com, .dev, .me...)' },
  {
    title: 'Registrar',
    description:
      'e.g. Porkbun, Namecheap, Cloudflare - sells domains to the public',
  },
  {
    title: 'Registry',
    description:
      'e.g. Verisign for .com - owns the TLD, keeps the master record',
  },
]

const ARROW_LABELS = ['buys from', 'registers with']

export function DomainRegistrationFlow() {
  return (
    <div className="not-prose bg-bg mx-auto my-6 flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      {STEPS.map((step, index) => (
        <Fragment key={step.title}>
          <div className="border-text/70 flex flex-col items-center gap-1.5 rounded-xl border px-6 py-5 text-center sm:flex-1">
            <span className="text-text text-base font-bold">{step.title}</span>
            <span className="text-text/60 text-sm">{step.description}</span>
          </div>
          {index < STEPS.length - 1 && (
            <div className="text-text flex flex-col items-center gap-1 py-1 sm:flex-1 sm:gap-1.5">
              <span className="text-xs font-semibold whitespace-nowrap">
                {ARROW_LABELS[index]}
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 rotate-90 sm:rotate-0"
                strokeWidth={1.75}
              />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}
