import katex from 'katex'
import { useMemo } from 'react'

type Props = {
  math: string
  display?: boolean
  className?: string
}

export function KatexMath({ math, display = false, className }: Props) {
  const html = useMemo(
    () =>
      katex.renderToString(math, { throwOnError: false, displayMode: display }),
    [math, display],
  )

  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  )
}
