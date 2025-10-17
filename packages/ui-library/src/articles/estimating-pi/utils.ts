export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  dashed: number[] = [],
  color: string = 'gray',
  fill: boolean = false,
  opacity: number = 1
): void {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.setLineDash(dashed)

  ctx.globalAlpha = opacity

  if (fill) {
    ctx.fillStyle = color
    ctx.fill()
  } else {
    ctx.strokeStyle = color
    ctx.stroke()
  }

  ctx.closePath()
  ctx.restore()
}

export const GREEN = '#55D949'
export const RED = '#E45D5D'
