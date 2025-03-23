type Props = {
	quote: string
	includeQuotes: boolean
}

const Quote = ({ quote, includeQuotes = false }: Props) => {
	return (
		<blockquote class="border-text/20 post-block border-l-4 py-2 pr-8 pl-4 font-medium italic">
			{includeQuotes ? `"${quote}"` : quote}
		</blockquote>
	)
}

export default Quote
