<script lang="ts">
	import { onMount } from 'svelte'

	const maxPoints = 10000

	let canvas: HTMLCanvasElement
	let ctx: CanvasRenderingContext2D

	const canvasSize = 300
	const pointSize = 18
	const rectSize = canvasSize - 2 * pointSize
	const lineWidth = 3

	let noOfPoints = 0
	let isActive = true

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

	function handleClick() {
		isActive = false
		setTimeout(() => {
			isActive = true
		}, 300)

		const { x, y } = generateRandomPoint()
		const isIn = isInside({ x, y })
		const color = isIn ? '#55D949' : '#E45D5D'

		noOfPoints++

		drawPoint({ x, y, color })
	}
</script>

<div class="flex post-block max-w-10/12 mx-auto">
	<div class="flex-1">
		<canvas bind:this={canvas} class="w-full"></canvas>
	</div>
	<div class="flex-1 flex flex-col justify-evenly items-center">
		<button
			disabled={!isActive || noOfPoints >= maxPoints}
			onclick={handleClick}
			class="rounded-full cursor-pointer disabled:cursor-default"
		>
			<div class="md:w-28 md:h-28 w-18 h-18 lg:w-36 lg:h-36 bg-action-secondary rounded-full">
				<div
					class={`w-full h-full bg-action-primary rounded-full flex items-center justify-center text-lg md:text-2xl lg:text-3xl font-bold transition-transform duration-200 text-white ${isActive ? 'sm:-translate-y-3 -translate-y-2' : 'translate-y-0'}`}
				>
					Add
				</div>
			</div>
		</button>
	</div>
</div>
