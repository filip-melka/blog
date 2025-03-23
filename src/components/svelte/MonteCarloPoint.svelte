<script lang="ts">
	export let size: 'sm' | 'md'
	export let color: 'green' | 'red'

	const SIZE = size === 'sm' ? 'w-3 h-3' : 'sm:w-6 sm:h-6 w-4 h-4'
	const COLOR = color === 'green' ? 'bg-[#55D949]' : 'bg-[#E45D5D]'
</script>

<span class={`rounded-full inline-block ${SIZE} ${COLOR}`}></span>
