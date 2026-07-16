import { Check, Copy } from 'lucide-react'
import { useRef, useState } from 'react'

type CodeBlockProps = {
  lang: string
  children: React.ReactNode
}

export function CodeBlock({ lang, children }: CodeBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = contentRef.current?.textContent ?? ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-white/10 bg-[#24292e] px-4 py-2">
      <div className="px-3text-xs flex items-center justify-between bg-[#24292e] text-sm text-[#e1e4e8]">
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
      <div
        ref={contentRef}
        className="overflow-x-auto text-sm [&_pre]:m-0 [&_pre]:p-3"
      >
        {children}
      </div>
    </div>
  )
}
