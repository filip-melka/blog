import { useEffect, useState } from 'react'
import { getMaxValues, getNGrams, getNGramsOccurrences } from '../bleu'
import { clsx } from 'clsx'

type CroppedPrecisionProps = {
  references: string[]
  prediction: string
}

type TableEntry = [string, number[], number, number]

function CroppedPrecision({ references, prediction }: CroppedPrecisionProps) {
  const [n, setN] = useState(1)

  const [tableEntries, setTableEntries] = useState<TableEntry[]>([])

  useEffect(() => {
    const predicitonNGrams = getNGramsOccurrences(getNGrams(n, prediction))

    const res: TableEntry[] = []

    Object.entries(predicitonNGrams).forEach(([nGram, predictedCount]) => {
      const matchingReferences = getMatchingReferences(nGram)
      const maxValues = getMaxValues(
        references.map((ref) => getNGramsOccurrences(getNGrams(n, ref)))
      )
      res.push([
        nGram,
        matchingReferences,
        predictedCount,
        maxValues[nGram] || 0,
      ])
    })

    setTableEntries(res)
  }, [n])

  function getMatchingReferences(nGram: string) {
    const res: number[] = []
    references.forEach((ref, i) => {
      if (ref.includes(nGram)) res.push(i + 1)
    })

    return res
  }

  return (
    <div className="not-prose py-12">
      <div className="flex gap-2 sm:gap-4">
        <div className="flex-1">
          <p className="mb-2 text-sm opacity-70">References:</p>
          {references.map((ref, i) => (
            <p className="mb-2 sm:text-lg" key={i}>
              <span className="opacity-50">{i + 1})</span>{' '}
              <span
                className={clsx('rounded px-1 py-0.5', {
                  'bg-blue-200 dark:bg-blue-800/80': i + 1 === 1,
                  'bg-orange-200 dark:bg-orange-800/80': i + 1 === 2,
                })}
              >
                {ref}
              </span>
            </p>
          ))}
        </div>
        <div className="flex-1">
          <p className="mb-2 text-sm opacity-70">Prediction:</p>
          <p className="sm:text-lg">{prediction}</p>
        </div>
      </div>
      <div className="mt-8 w-full">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-sm sm:text-base dark:bg-gray-600">
              <th className="w-52 py-2 pl-4 text-left text-xs sm:text-base">
                {n}-gram
              </th>
              <th className="w-20 py-2 text-xs sm:text-base">
                Matching References
              </th>
              <th className="w-32 py-2 text-xs sm:text-base">
                Matched Predicted Count
              </th>
              <th className="w-32 py-2 text-xs sm:text-base">Clipped Count</th>
            </tr>
          </thead>
          <tbody>
            {tableEntries.map(
              ([nGram, matchingReferences, predictedCount, clippedCount]) => (
                <tr key={nGram} className="border-t border-gray-200">
                  <td className="py-3 pl-4">{nGram}</td>
                  <td className="py-3 text-center">
                    {matchingReferences.length === 0 ? (
                      <div className="my-0.5">None</div>
                    ) : (
                      <div className="flex justify-center gap-4">
                        {matchingReferences.map((ref, i) => (
                          <span
                            key={i}
                            className={clsx('rounded px-1 py-0.5', {
                              'bg-blue-200 dark:bg-blue-800/80': ref === 1,
                              'bg-orange-200 dark:bg-orange-800/80': ref === 2,
                            })}
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-center">{predictedCount}</td>
                  <td className="py-3 text-center">{clippedCount}</td>
                </tr>
              )
            )}
            <tr className="bg-gray-100 dark:bg-gray-600">
              <td className="py-2 pl-4" colSpan={3}>
                Total
              </td>
              <td className="py-2 text-center font-bold">
                {tableEntries
                  .map((entry) => entry[3])
                  .reduce((a, b) => a + b, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <p className="mt-8 text-center text-lg sm:text-xl">
          The precision of <span className="font-semibold">{n}-gram</span> is{' '}
          <span className="font-semibold">
            {tableEntries.map((entry) => entry[3]).reduce((a, b) => a + b, 0)}/
            {tableEntries.length}
          </span>
        </p>
      </div>
      <div className="mx-auto mt-12 w-28">
        <select
          value={n}
          onChange={(e) => {
            setN(Number(e.target.value))
          }}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        >
          {[1, 2].map((newN) => (
            <option value={newN} key={newN}>
              {newN}-Gram
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default CroppedPrecision
