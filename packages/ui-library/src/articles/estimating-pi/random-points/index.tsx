import { useEffect, useRef, useState } from 'react'
import { drawCircle, GREEN, RED } from '../utils'

const RECT_SIZE = 800
const POINT_SIZE = 80

function RandomPoints() {
  const [isClicked, setIsClicked] = useState(false)
  const canvasRef = useRef<null | HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    if (ctx) {
      ctx.lineWidth = 10
      ctx.strokeStyle = 'gray'

      // draw rect
      ctx.beginPath()
      ctx.rect(POINT_SIZE / 2, POINT_SIZE / 2, RECT_SIZE, RECT_SIZE)
      ctx.stroke()

      // draw circle
      drawCircle(
        ctx,
        (RECT_SIZE + POINT_SIZE) / 2,
        (RECT_SIZE + POINT_SIZE) / 2,
        RECT_SIZE / 2,
        [50, 30]
      )
    }
  }, [canvasRef])

  function addPoint() {
    const ctx = canvasRef.current?.getContext('2d')

    if (ctx) {
      const x = Math.random() * RECT_SIZE
      const y = Math.random() * RECT_SIZE
      const color =
        Math.sqrt(
          Math.pow(RECT_SIZE / 2 - x, 2) + Math.pow(RECT_SIZE / 2 - y, 2)
        ) <=
        RECT_SIZE / 2
          ? GREEN
          : RED

      drawCircle(
        ctx,
        x + POINT_SIZE / 2,
        y + POINT_SIZE / 2,
        POINT_SIZE / 2,
        [],
        color,
        true
      )
    }
  }

  function handleClick() {
    setIsClicked(true)
    addPoint()
  }

  useEffect(() => {
    if (isClicked) {
      setTimeout(() => {
        setIsClicked(false)
      }, 500)
    }
  }, [isClicked])

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          width={RECT_SIZE + POINT_SIZE}
          height={RECT_SIZE + POINT_SIZE}
          className="mx-auto aspect-square w-full max-w-64"
        ></canvas>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="h-26 w-26 rounded-full bg-[#BB7A01]">
          <button
            onClick={handleClick}
            disabled={isClicked}
            className="h-full w-full -translate-y-3 cursor-pointer rounded-full bg-[#F59F00] text-2xl font-semibold text-white disabled:translate-0 disabled:cursor-default"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default RandomPoints
