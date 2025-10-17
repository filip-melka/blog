import { useEffect, useRef, useState } from 'react'
import { drawCircle, GREEN, RED } from '../utils'
import { Pi } from 'lucide-react'
import { clsx } from 'clsx'

const RECT_SIZE = 800
const POINT_SIZE = 80

class MyPoint {
  public time
  public x
  public y
  public color

  constructor(x: number, y: number, color: string) {
    this.x = x
    this.y = y
    this.color = color
    this.time = 30
  }
}

const pi = Math.PI.toFixed(5)

function Estimation() {
  const [isClicked, setIsClicked] = useState(false)
  const [countIn, setCountIn] = useState(0)
  const [countOut, setCountOut] = useState(0)
  const [estimatedPi, setEstimatedPi] = useState('0.00000')
  const canvasRef = useRef<null | HTMLCanvasElement>(null)
  const ctxRef = useRef<undefined | CanvasRenderingContext2D>(null)
  const animationIdRef = useRef<null | number>(null)

  const pointsRef = useRef<MyPoint[]>([])

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d')

    addShapes()
  }, [canvasRef])

  function addPoint() {
    const x = Math.random() * RECT_SIZE
    const y = Math.random() * RECT_SIZE
    const isInside =
      Math.sqrt(
        Math.pow(RECT_SIZE / 2 - x, 2) + Math.pow(RECT_SIZE / 2 - y, 2)
      ) <=
      RECT_SIZE / 2

    if (isInside) {
      setCountIn((curr) => curr + 1)
    } else {
      setCountOut((curr) => curr + 1)
    }

    const newPoint = new MyPoint(x, y, isInside ? GREEN : RED)
    pointsRef.current.push(newPoint)
  }

  function addShapes() {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = 10
      ctxRef.current.strokeStyle = 'gray'

      // draw rect
      ctxRef.current.beginPath()
      ctxRef.current.rect(POINT_SIZE / 2, POINT_SIZE / 2, RECT_SIZE, RECT_SIZE)
      ctxRef.current.stroke()

      // draw circle
      drawCircle(
        ctxRef.current,
        (RECT_SIZE + POINT_SIZE) / 2,
        (RECT_SIZE + POINT_SIZE) / 2,
        RECT_SIZE / 2,
        [50, 30]
      )
    }
  }

  let msPrev = window.performance.now()
  const fps = 10
  const msPerFrame = 1000 / fps

  function animate() {
    animationIdRef.current = requestAnimationFrame(animate)

    const msNow = window.performance.now()
    const msPassed = msNow - msPrev

    if (msPassed < msPerFrame) return

    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime

    loop()
  }

  function removePoints() {
    pointsRef.current = pointsRef.current.filter((point) => point.time > 0)
  }

  function clear() {
    ctxRef.current?.clearRect(
      0,
      0,
      RECT_SIZE + POINT_SIZE,
      RECT_SIZE + POINT_SIZE
    )
  }

  function reducePoints() {
    pointsRef.current.forEach((point) => point.time--)
  }

  function loop() {
    removePoints()
    clear()
    addShapes()
    addPoint()
    drawPoints()
    reducePoints()
  }

  function drawPoints() {
    pointsRef.current.forEach((point) => {
      if (ctxRef.current) {
        drawCircle(
          ctxRef.current,
          point.x + POINT_SIZE / 2,
          point.y + POINT_SIZE / 2,
          POINT_SIZE / 2,
          [],
          point.color,
          true,
          point.time / 30
        )
      }
    })
  }

  function handleClick() {
    setIsClicked((currentVal) => {
      const isRunning = !currentVal

      if (isRunning) {
        startAnimation()
      } else {
        stopAnimation()
      }

      return isRunning
    })
  }

  function startAnimation() {
    animationIdRef.current = requestAnimationFrame(animate)
  }

  function stopAnimation() {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }
  }

  useEffect(() => {
    setEstimatedPi(((countIn / (countIn + countOut)) * 4)?.toFixed(5))
  }, [countIn, countOut])

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <div className="flex-1">
        <div className="mx-auto mb-2 flex max-w-64 justify-evenly text-lg">
          <div className="ml-8 flex w-16 items-center gap-2">
            <Point isGreen={true} />
            <span>{countIn}</span>
          </div>
          <div className="flex w-16 items-center gap-2">
            <Point isGreen={false} />
            <span>{countOut}</span>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={RECT_SIZE + POINT_SIZE}
          height={RECT_SIZE + POINT_SIZE}
          className="mx-auto aspect-square w-full max-w-64"
        ></canvas>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div
          className="flex items-center"
          style={{
            opacity: estimatedPi === 'NaN' ? 0 : 1,
          }}
        >
          <Pi size={30} />
          <div className="flex text-3xl">
            <span>=</span>
            {estimatedPi.split('').map((digit, i) => (
              <span
                className={clsx({
                  'bg-green-300':
                    estimatedPi.slice(0, i + 1) === pi.slice(0, i + 1),
                })}
              >
                {digit}
              </span>
            ))}
          </div>
        </div>
        <div className="h-26 w-26 rounded-full bg-[#BB7A01]">
          <button
            onClick={handleClick}
            className={clsx(
              'h-full w-full cursor-pointer rounded-full bg-[#F59F00] text-2xl font-semibold text-white disabled:translate-0 disabled:cursor-default',
              {
                'translate-0': isClicked,
                '-translate-y-3': !isClicked,
              }
            )}
          >
            {isClicked ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Estimation

export function Point({ isGreen }: { isGreen: boolean }) {
  return (
    <div
      className="h-4 w-4 rounded-full"
      style={{
        background: isGreen ? GREEN : RED,
      }}
    ></div>
  )
}
