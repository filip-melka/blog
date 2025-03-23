import { createSignal, onMount } from 'solid-js'
import { supabase } from '../../lib/supabase'

function debounce(func: Function, timeout: number) {
	let timer: NodeJS.Timeout
	return () => {
		if (timer) clearTimeout(timer)

		timer = setTimeout(() => {
			func()
		}, timeout)
	}
}

enum State {
	loading,
	error,
	display
}

const Claps = ({ slug }: { slug: string }) => {
	const [state, setState] = createSignal(State.loading)
	const [claps, setClaps] = createSignal(0)
	const [addedClaps, setAddedClaps] = createSignal(0)

	const maxAddClaps = 99

	let popUpRef: HTMLDivElement
	let labelRef: HTMLSpanElement

	const hideLabel = debounce(() => {
		popUpRef!.classList.add('scale-0')
		popUpRef!.classList.add('text-transparent')
		popUpRef!.classList.remove('animate-bounce')
		labelRef!.classList.remove('text-green-500')
		saveClaps(addedClaps())
		setAddedClaps(0)
	}, 1500)

	async function saveClaps(noOfClaps: number) {
		await supabase.rpc('increment_claps', {
			increment_by: noOfClaps,
			story_id: slug
		})
	}

	function handleClick() {
		popUpRef!.classList.add('animate-bounce')
		popUpRef!.classList.remove('text-transparent')
		popUpRef!.classList.remove('scale-0')
		labelRef!.classList.add('text-green-500')
		setClaps(claps() + 1)
		setAddedClaps(addedClaps() + 1)

		hideLabel()
	}

	async function fetchClaps() {
		const { data } = await supabase.from('stories').select('claps').eq('id', slug).single()

		if (data) {
			setClaps(data.claps)
			setState(State.display)
		} else {
			setState(State.error)
		}
	}

	onMount(() => {
		fetchClaps()
	})

	return (
		<>
			{state() !== State.error && (
				<div class="flex items-center gap-1">
					<div class="relative">
						<div
							ref={popUpRef!}
							class="absolute top-0 left-0 hidden h-full w-full -translate-y-14 scale-0 items-center justify-center rounded-full bg-gray-300/20 text-sm font-medium transition-transform duration-300 lg:flex"
						>
							+{addedClaps()}
						</div>
						<button
							onClick={handleClick}
							disabled={addedClaps() >= maxAddClaps}
							class="cursor-pointer rounded-full p-1.5 text-3xl transition-transform duration-200 sm:text-4xl lg:text-3xl lg:hover:scale-125"
						>
							👏
						</button>
					</div>
					{state() === State.display && (
						<span ref={labelRef!} class="text-base font-medium transition-colors duration-500">
							{claps()}
						</span>
					)}
				</div>
			)}
		</>
	)
}

export default Claps
