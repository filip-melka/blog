import { Check, ChevronDown, Copy } from 'lucide-react'
import { useRef, useState } from 'react'

type CodeBlockProps = {
  lang: string
  collapsible?: boolean
  children: React.ReactNode
}

export function CodeBlock({ lang, collapsible, children }: CodeBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(!collapsible)

  const peeking = collapsible === true && !expanded

  async function handleCopy() {
    const text = contentRef.current?.textContent ?? ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-white/10 bg-[#24292e] px-4 py-2">
      <div className="flex items-center justify-between bg-[#24292e] px-3 text-xs text-[#e1e4e8]">
        <span className="font-mono text-[#e1e4e8]/60">{lang}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[#e1e4e8]/60 transition-colors hover:text-[#e1e4e8]"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <div
          className={`overflow-x-auto text-sm [&_.line]:inline-block [&_.line]:w-full [&_.line]:px-3 [&_.line]:leading-6 [&_.line.highlighted]:bg-white/10 [&_pre]:m-0 [&_pre]:py-3 ${
            peeking
              ? 'max-h-27 overflow-y-hidden [&_.line:nth-of-type(n+3)]:blur-[2px]'
              : ''
          }`}
        >
          <div ref={contentRef}>{children}</div>
        </div>
        {peeking && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-[#24292e] pt-8 pb-2">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 rounded-md border border-white/10 bg-[#24292e] px-3 py-2 text-xs text-[#e1e4e8]/80 transition-colors hover:text-[#e1e4e8]"
            >
              <ChevronDown size={14} />
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
