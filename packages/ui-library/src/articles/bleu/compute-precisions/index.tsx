import { getNGrams, getNGramsOccurrences } from '../bleu'

function NGrams({
  maxN = 2,
  reference = 'the cat is sitting on the mat',
  prediction = 'the cat on the mat',
}) {
  return (
    <div className="not-prose py-12">
      <div className="flex justify-evenly gap-2 sm:gap-4">
        <div>
          <span className="text-sm">Reference:</span>
          <p className="rounded bg-green-100 px-2 py-0.5 sm:text-lg dark:bg-green-800/80">
            {reference}
          </p>
        </div>
        <div>
          <span className="text-sm">Prediciton:</span>
          <p className="rounded bg-blue-100 px-2 py-0.5 sm:text-lg dark:bg-blue-800/80">
            {prediction}
          </p>
        </div>
      </div>
      {Array.from({ length: maxN }, (_, i) => i).map((n) => {
        const nGrams = getNGramsOccurrences(getNGrams(n + 1, prediction))

        const totalCount = Object.values(nGrams).reduce((a, b) => a + b, 0)
        const clippedCount = Object.keys(nGrams)
          .map((token) => {
            return Math.min(reference.split(token).length - 1, nGrams[token])
          })
          .reduce((a, b) => a + b, 0)

        return (
          <div key={n} className="mx-auto mt-10">
            <span className="font-semibold italic">{n + 1}-gram</span>
            <div className="mt-3 flex px-8 text-sm">
              <span className="flex-2">Token</span>
              <span className="flex-1 text-center">Is present</span>
              <span className="flex-1 text-center">Clipped count</span>
            </div>
            {Object.keys(nGrams).map((token, i) => (
              <div key={i} className="my-2 flex items-center px-8">
                <span className="flex-2 font-semibold">{token}</span>
                <span className="flex-1 text-center text-sm">
                  {reference.split(token).length - 1 > 0 ? '✅' : '❌'}
                </span>
                <span className="flex-1 text-center">
                  {Math.min(reference.split(token).length - 1, nGrams[token])}
                </span>
              </div>
            ))}
            <div className="mt-4 flex justify-between bg-gray-100 px-8 py-0.5 dark:bg-gray-600">
              <span className="flex-3">Precision</span>
              <span className="flex-1 text-center font-semibold">
                {clippedCount} / {totalCount}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NGrams
