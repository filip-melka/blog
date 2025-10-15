export function getNGrams(n: number, text: string) {
  const nGrams: string[] = []
  const arr = text.split(' ')

  if (arr.length < n) return []

  let i = 0

  while (i < arr.length - n + 1) {
    nGrams.push(arr.slice(i, i + n).join(' '))
    i++
  }

  return nGrams
}

export function getMaxValues(
  records: Record<string, number>[]
): Record<string, number> {
  const maxValues: Record<string, number> = {}

  for (const record of records) {
    for (const key in record) {
      maxValues[key] = Math.max(record[key], maxValues[key] ?? -Infinity)
    }
  }

  return maxValues
}

export function getNGramsOccurrences(nGrams: string[]): Record<string, number> {
  const res: Record<string, number> = {}

  nGrams.forEach((nGram) => {
    res[nGram] = (res[nGram] || 0) + 1
  })

  return res
}

function computePrecision(n: number, references: string[], prediction: string) {
  const p = getNGramsOccurrences(getNGrams(n, prediction))
  const r = getMaxValues(
    references.map((ref) => getNGramsOccurrences(getNGrams(n, ref)))
  )

  let clippedCount = 0
  let totalCount = 0

  for (const nGram in p) {
    clippedCount += Math.min(p[nGram], r[nGram] ?? 0)
    totalCount += p[nGram]
  }

  const precision = totalCount === 0 ? 0 : clippedCount / totalCount
  console.log(`Precision for ${n}-grams:`, precision)
  return precision
}

function computeGeometricAverage(values: number[]) {
  return Math.pow(
    values.reduce((res, num) => res * num, 1),
    1 / values.length
  )
}

function computeBrevityPenalty(references: string[], prediction: string) {
  const c = prediction.length
  const r = Math.max(...references.map((ref) => ref.length))
  if (c > r) return 1

  return Math.pow(Math.E, 1 - r / c)
}

export function bleu(references: string[], prediction: string, N = 2) {
  console.log(getNGrams(2, 'the cat sleeps on the couch'))
  const precisions: number[] = []
  for (let n = 1; n <= N; n++) {
    precisions.push(computePrecision(n, references, prediction))
  }

  const geometricMean = computeGeometricAverage(precisions)
  console.log('geometric mean:', geometricMean)

  const brevityPenalty = computeBrevityPenalty(references, prediction)
  console.log('brevity penalty:', brevityPenalty)

  const bleuScore = brevityPenalty * geometricMean
  console.log('BLEU score:', bleuScore)

  return {
    precisions,
    geometricMean,
    brevityPenalty,
    score: bleuScore,
  }
}
