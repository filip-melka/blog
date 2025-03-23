<script lang="ts">
	import MonteCarloCanvas from './MonteCarloCanvas.svelte'
	import MonteCarloPoint from './MonteCarloPoint.svelte'

	let noOfPointsIn = $state(0)
	let noOfPointsOut = $state(0)
	let isActive = $state(false)
	const maxPoints = 10000

	let piValue = $derived.by(() => {
		if (noOfPointsOut === 0) return null

		return (4 * (noOfPointsIn / (noOfPointsIn + noOfPointsOut))).toFixed(4)
	})

	function handleClick() {
		isActive = !isActive
	}

	interface Digit {
		value: string
		bgColor: string
		textColor: string
	}

	function getDigits() {
		const res: Digit[] = []

		if (piValue) {
			const digits = piValue.split('')
			const pi = Math.PI.toFixed(4)

			let isCorrect = true

			digits.forEach((digit, index) => {
				if (!isCorrect || digit === '.') {
					res.push({
						value: digit,
						bgColor: 'bg-transparent',
						textColor: 'text-text'
					})
				} else if (digit === pi[index]) {
					res.push({
						value: digit,
						bgColor: 'bg-green-200/90',
						textColor: 'text-green-900'
					})
				} else {
					isCorrect = false
					res.push({
						value: digit,
						bgColor: 'bg-red-200/90',
						textColor: 'text-red-900'
					})
				}
			})
		} else {
			const placeholders = ['?', '.', '?', '?', '?', '?']
			placeholders.forEach((symbol) => {
				res.push({
					value: symbol,
					bgColor: 'bg-transparent',
					textColor: 'text-text'
				})
			})
		}

		return res
	}
</script>

<div class="flex post-block max-w-10/12 mx-auto justify-between">
	<div class="flex-1 max-w-6/12">
		<div class="flex justify-center gap-4 md:gap-8 mb-1">
			<div class="flex items-center gap-2 pl-12">
				<MonteCarloPoint size="md" color="green" />
				<span class="min-w-12">{noOfPointsIn}</span>
			</div>
			<div class="flex items-center gap-2">
				<MonteCarloPoint size="md" color="red" />
				<span class="min-w-12">{noOfPointsOut}</span>
			</div>
		</div>
		<MonteCarloCanvas bind:noOfPointsIn bind:noOfPointsOut {isActive} {maxPoints} />
	</div>
	<div class="flex-1 flex flex-col justify-evenly items-center">
		<button
			disabled={noOfPointsIn + noOfPointsOut >= maxPoints}
			onclick={handleClick}
			class="rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-default"
		>
			<div class="md:w-28 md:h-28 w-18 h-18 lg:w-36 lg:h-36 bg-action-secondary rounded-full">
				<div
					class={`w-full h-full bg-action-primary rounded-full flex items-center justify-center text-lg md:text-2xl lg:text-3xl font-bold transition-transform duration-200 text-white ${!isActive ? 'sm:-translate-y-3 -translate-y-2' : 'translate-y-0'}`}
				>
					{isActive ? 'Stop' : 'Start'}
				</div>
			</div>
		</button>
		<p class={`md:text-2xl lg:text-3xl text-lg sm:text-xl`}>
			Pi = <span class="inline-block">
				{#each getDigits() as digit}
					<span class={`${digit.bgColor} ${digit.textColor} px-0.5 rounded mr-0.5`}
						>{digit.value}</span
					>
				{/each}
			</span>
		</p>
	</div>
</div>
