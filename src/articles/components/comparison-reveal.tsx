import { useState } from 'react'

type Props = {
  left: string | number
  right: string | number
  sign: '=' | '<' | '>'
}

export function ComparisonReveal({ left, right, sign }: Props) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="not-prose bg-bg mx-auto flex w-fit items-center justify-center gap-[26px] px-8 py-3.5">
      <span className="text-text text-4xl">{left}</span>
      {revealed ? (
        <span className="text-text flex h-[52px] w-[52px] shrink-0 items-center justify-center text-4xl">
          {sign}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          aria-label="Reveal comparison sign"
          className="bg-text text-bg flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] text-4xl transition-colors hover:opacity-90"
        >
          ?
        </button>
      )}
      <span className="text-text text-4xl">{right}</span>
    </div>
  )
}
