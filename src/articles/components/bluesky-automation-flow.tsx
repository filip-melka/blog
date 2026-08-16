import { ArrowRight } from 'lucide-react'

type Step = {
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    title: 'Deploy Succeeds',
    description: 'GitHub Pages finishes deploying the site',
  },
  {
    title: 'Workflow Wakes Up',
    description: 'The Bluesky Action triggers automatically',
  },
  {
    title: 'Checks the Feed',
    description: "Pages its own posts to see what's already announced",
  },
  {
    title: 'Filters by Date',
    description: 'Keeps only unposted articles from the last 30 days',
  },
  {
    title: 'Builds the Caption',
    description: 'From frontmatter, or the site-wide defaults',
  },
  {
    title: 'Uploads & Posts',
    description: 'Banner + caption go out as a link card',
  },
]

// Desktop lays the six steps out as a two-row "snake" (left-to-right, then
// right-to-left back underneath) to keep the flow compact; mobile just
// stacks all six top to bottom. DOM order stays 1-6 either way for reading
// order, so only the grid placement and arrow rotation differ per breakpoint.
const CARD_POSITIONS = [
  'md:col-start-1 md:row-start-1',
  'md:col-start-3 md:row-start-1',
  'md:col-start-5 md:row-start-1',
  'md:col-start-5 md:row-start-3',
  'md:col-start-3 md:row-start-3',
  'md:col-start-1 md:row-start-3',
]

function StepCard({ step, position }: { step: Step; position: string }) {
  return (
    <div
      className={`border-text/70 flex w-full flex-col items-start gap-1 rounded-xl border px-5 py-4 text-left ${position}`}
    >
      <span className="text-text text-sm font-bold">{step.title}</span>
      <span className="text-text/60 text-sm">{step.description}</span>
    </div>
  )
}

function Arrow({ position, rotation }: { position: string; rotation: string }) {
  return (
    <div
      className={`flex items-center justify-center py-1 md:py-0 ${position}`}
    >
      <ArrowRight
        className={`text-text h-5 w-5 shrink-0 rotate-90 ${rotation}`}
        strokeWidth={1.75}
      />
    </div>
  )
}

export function BlueskyAutomationFlow() {
  return (
    <div className="not-prose bg-bg mx-auto my-6 flex w-full max-w-3xl flex-col gap-2 md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr] md:grid-rows-[auto_auto_auto] md:items-center md:gap-3">
      <StepCard step={STEPS[0]} position={CARD_POSITIONS[0]} />
      <Arrow position="md:col-start-2 md:row-start-1" rotation="md:rotate-0" />
      <StepCard step={STEPS[1]} position={CARD_POSITIONS[1]} />
      <Arrow position="md:col-start-4 md:row-start-1" rotation="md:rotate-0" />
      <StepCard step={STEPS[2]} position={CARD_POSITIONS[2]} />
      <Arrow position="md:col-start-5 md:row-start-2" rotation="md:rotate-90" />
      <StepCard step={STEPS[3]} position={CARD_POSITIONS[3]} />
      <Arrow
        position="md:col-start-4 md:row-start-3"
        rotation="md:rotate-180"
      />
      <StepCard step={STEPS[4]} position={CARD_POSITIONS[4]} />
      <Arrow
        position="md:col-start-2 md:row-start-3"
        rotation="md:rotate-180"
      />
      <StepCard step={STEPS[5]} position={CARD_POSITIONS[5]} />
    </div>
  )
}
