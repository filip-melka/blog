export type Point = {
  id: number
  // Coordinates normalized to the unit square [-1, 1] x [-1, 1], so
  // "inside" reflects the true inscribed-circle geometry regardless of
  // how the point is later scaled down for rendering.
  x: number
  y: number
  inside: boolean
  addedAt: number
}

export const MAX_POINTS = 50_000

export function randomPoint(id: number): Point {
  const x = Math.random() * 2 - 1
  const y = Math.random() * 2 - 1
  return { id, x, y, inside: x * x + y * y <= 1, addedAt: Date.now() }
}
