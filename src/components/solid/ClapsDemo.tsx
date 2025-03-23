import { createSignal } from 'solid-js'
import { BsDatabase, BsDatabaseCheck } from 'solid-icons/bs'

function debounce(func: Function, timeout: number) {
	let timer: NodeJS.Timeout
	return () => {
		if (timer) clearTimeout(timer)

		timer = setTimeout(() => {
			func()
		}, timeout)
	}
}

type Props = {
	includeBubble: boolean
	includeDebounce: boolean
	sendDBRequest: () => void
}

const ClapsButton = ({ includeBubble, includeDebounce, sendDBRequest }: Props) => {
	const [claps, setClaps] = createSignal(0)
	const [addedClaps, setAddedClaps] = createSignal(0)

	const maxAddClaps = 99

	let popUpRef: HTMLDivElement
	let labelRef: HTMLSpanElement

	const hideLabel = debounce(() => {
		if (includeBubble) {
			popUpRef!.classList.add('scale-0')
			popUpRef!.classList.add('text-transparent')
			popUpRef!.classList.remove('animate-bounce')
			labelRef!.classList.remove('text-green-500')
			sendDBRequest()
		}
		setAddedClaps(0)
	}, 1500)

	function handleClick() {
		if (includeBubble) {
			popUpRef!.classList.add('animate-bounce')
			popUpRef!.classList.remove('text-transparent')
			popUpRef!.classList.remove('scale-0')
			labelRef!.classList.add('text-green-500')
		}
		setClaps(claps() + 1)
		setAddedClaps(addedClaps() + 1)

		if (includeDebounce) {
			hideLabel()
		}
	}

	const clapClasses = includeBubble
		? 'cursor-pointer rounded-full p-1.5 text-3xl transition-transform duration-200 hover:scale-125 sm:text-4xl lg:text-3xl'
		: 'cursor-pointer rounded-full p-1.5 text-3xl sm:text-4xl lg:text-3xl'

	return (
		<div class="flex items-center gap-1">
			<div class="relative">
				<div
					ref={popUpRef!}
					class="absolute top-0 left-0 flex h-full w-full -translate-y-14 scale-0 items-center justify-center rounded-full bg-gray-300/20 text-sm font-medium transition-transform duration-300"
				>
					+{addedClaps()}
				</div>
				<button onClick={handleClick} disabled={addedClaps() >= maxAddClaps} class={clapClasses}>
					👏
				</button>
			</div>
			<span ref={labelRef!} class="text-base font-medium transition-colors duration-500">
				{claps()}
			</span>
		</div>
	)
}

const ClapsDemo = ({ includeBubble, includeDebounce }: Props) => {
	const [isSendingRequest, setIsSendingRequest] = createSignal(false)

	function sendDBRequest() {
		setIsSendingRequest(true)

		setTimeout(() => {
			setIsSendingRequest(false)
		}, 1500)
	}

	return (
		<div class="post-block relative my-10 flex items-center justify-center py-16">
			<ClapsButton
				includeBubble={includeBubble}
				includeDebounce={includeDebounce}
				sendDBRequest={sendDBRequest}
			/>
			{includeDebounce && (
				<div class="absolute top-0 right-0 flex items-center gap-2">
					{isSendingRequest() ? (
						<BsDatabaseCheck class="text-4xl" />
					) : (
						<BsDatabase class="text-4xl" />
					)}
				</div>
			)}
		</div>
	)
}

export default ClapsDemo
