import { createSignal } from 'solid-js'

type Props = {
	file: string
	children: HTMLElement
}

const Code = ({ file = '', children }: Props) => {
	const [isCopied, setIsCopied] = createSignal(false)

	function handleClick() {
		if (children.textContent) {
			navigator.clipboard.writeText(children.textContent).then(() => {
				setIsCopied(true)
				setTimeout(() => {
					setIsCopied(false)
				}, 2000)
			})
		}
	}

	return (
		<div class="post-block bg-code overflow-hidden rounded-lg">
			<div class="flex justify-between bg-white/30 px-4 py-2 text-sm text-white">
				<span>{file}</span>
				<button class="cursor-pointer" onClick={handleClick}>
					{isCopied() ? 'Copied' : 'Copy'}
				</button>
			</div>
			<div class="p-4">{children}</div>
		</div>
	)
}

export default Code
