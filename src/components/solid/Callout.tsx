function parseString(str: string) {
	return str.split(/(`.*?`)/g).map((part) => {
		if (part.startsWith('`') && part.endsWith('`')) {
			const codeContent = part.slice(1, -1)
			return <code class="text-text text-sm font-normal">{codeContent}</code>
		}
		return part
	})
}

type Props = {
	children: HTMLElement
	title?: string
}

const Callout = ({ children, title }: Props) => {
	return (
		<div class="post-block relative bg-blue-300/20 p-6">
			<span class="absolute -top-4 -left-4 text-3xl">💡</span>
			{title && <p class="pb-2 font-medium">{parseString(title)}</p>}
			<div>{children}</div>
		</div>
	)
}

export default Callout
