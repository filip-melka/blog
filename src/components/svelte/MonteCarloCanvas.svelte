<script lang="ts">
	import { onMount } from 'svelte'

	let { isActive, maxPoints, noOfPointsIn = $bindable(), noOfPointsOut = $bindable() } = $props()

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D

	const canvasSize = 300
	const pointSize = 10
	const rectSize = canvasSize - 2 * pointSize
	const lineWidth = 3
	const fps = 20
	const interval = 1000 / fps

	onMount(() => {
		ctx = canvas.getContext('2d')!
		canvas.width = canvasSize
		canvas.height = canvasSize

		// draw outer rectangle
		ctx.beginPath()
		ctx.strokeStyle = 'gray'
		ctx.lineWidth = lineWidth
		ctx.rect(pointSize, pointSize, rectSize, rectSize)
		ctx.stroke()

		// draw dashed circle
		ctx.beginPath()
		ctx.setLineDash([15, 10])
		ctx.arc(canvasSize / 2, canvasSize / 2, rectSize / 2, 0, 2 * Math.PI)
		ctx.stroke()

		let lastTime = performance.now()

		function loop(timestamp: number) {
			const delta = timestamp - lastTime

			if (delta >= interval) {
				lastTime = timestamp - (delta % interval)
				const { x, y } = generateRandomPoint()
				const isIn = isInside({ x, y })
				const color = isIn ? '#55D949' : '#E45D5D'

				if (isIn) {
					noOfPointsIn++
				} else {
					noOfPointsOut++
				}

				drawPoint({ x, y, color })
			}

			if (isActive && noOfPointsIn + noOfPointsOut < maxPoints) {
				requestAnimationFrame(loop)
			}
		}

		$effect(() => {
			if (isActive && noOfPointsIn + noOfPointsOut < maxPoints) {
				requestAnimationFrame(loop)
			}
		})
	})

	function isInside({ x, y }: { x: number; y: number }) {
		return Math.sqrt(x * x + y * y) <= rectSize / 2
	}

	function generateRandomPoint() {
		const x = Math.random() * rectSize - rectSize / 2
		const y = Math.random() * rectSize - rectSize / 2

		return { x, y }
	}

	function drawPoint({ x, y, color }: { x: number; y: number; color: string }) {
		ctx.globalAlpha = 0.8
		ctx.beginPath()
		ctx.arc(canvasSize / 2 + x, canvasSize / 2 + y, pointSize / 2, 0, 2 * Math.PI)
		ctx.fillStyle = color
		ctx.fill()
	}
</script>

<canvas bind:this={canvas} class="w-full"></canvas>
