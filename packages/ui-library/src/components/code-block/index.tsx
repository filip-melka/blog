import { Clipboard, ClipboardCheck } from 'lucide-react'
import { ReactNode, useRef, useState } from 'react'

type CodeBlockProps = {
  language: string
  children: ReactNode
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)

  function copyToClipboard() {
    const codeText = codeRef.current?.innerText
    if (codeText) {
      navigator.clipboard
        .writeText(codeText)
        .then(() => {
          setIsCopied(true)
          setTimeout(() => {
            setIsCopied(false)
          }, 1500)
        })
        .catch((err) => {
          console.error('Failed to copy: ', err)
        })
    }
  }

  return (
    <div
      className="not-prose bg-codeblock relative w-full rounded-lg px-6 py-5"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="absolute top-2 right-2">
        {isHovering ? (
          <button
            className="flex h-9 w-9 items-center justify-center rounded border border-gray-300/20 bg-gray-200/10 text-white/70 transition-colors duration-200 hover:cursor-pointer hover:bg-gray-200/0"
            onClick={copyToClipboard}
          >
            {isCopied ? <ClipboardCheck size={20} /> : <Clipboard size={20} />}
          </button>
        ) : (
          <span className="pr-2 text-sm text-white/80">{language}</span>
        )}
      </div>

      <div ref={codeRef}>{children}</div>
    </div>
  )
}

export default CodeBlock
