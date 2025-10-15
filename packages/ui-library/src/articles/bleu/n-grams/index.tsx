import { useState } from 'react'
import { getNGrams } from '../bleu'
import { clsx } from 'clsx'

function NGrams({ text = 'he is eating tasty apple' }) {
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([])
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)

  function range(a: number, b: number) {
    return Array.from({ length: b - a + 1 }, (_, i) => a + i)
  }

  const colors = [
    'bg-green-100 hover:bg-green-300',
    'bg-blue-100 hover:bg-blue-300',
    'bg-orange-100 hover:bg-orange-300',
    'bg-red-100 hover:bg-red-300',
  ]

  const baseColors = [
    'bg-green-300',
    'bg-blue-300',
    'bg-orange-300',
    'bg-red-300',
  ]

  function addLabel(n: number) {
    switch (n) {
      case 1:
        return <span className="font-medium italic"> (unigram)</span>
      case 2:
        return <span className="font-medium italic"> (bigram)</span>
      case 3:
        return <span className="font-medium italic"> (trigram)</span>
      default:
        return ''
    }
  }

  return (
    <div className="article-component-container">
      <p className="flex flex-wrap justify-center text-xl">
        {text.split(' ').map((word, i) => (
          <span
            className={clsx(
              'px-2 py-1 transition-colors duration-75',
              baseColors[selectedColorIndex],
              {
                'bg-transparent': !highlightedIndices.includes(i),
              }
            )}
          >
            {word}
          </span>
        ))}
      </p>
      <div className="mx-auto flex w-fit cursor-default flex-col gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div>
            <span className="text-sm font-semibold">
              {n}-grams{addLabel(n)}:
            </span>
            <div className="mt-2 flex gap-2">
              {getNGrams(n, text).map((nGram, i) => (
                <span
                  onMouseEnter={() => {
                    const startIndex = i
                    const endIndex = i + n - 1
                    setSelectedColorIndex(n - 1)
                    setHighlightedIndices(range(startIndex, endIndex))
                  }}
                  onMouseLeave={() => setHighlightedIndices([])}
                  className={clsx(
                    'rounded px-2 py-0.5 transition-colors duration-75',
                    colors[n - 1]
                  )}
                >
                  {nGram}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NGrams
