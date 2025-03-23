type Props = {
	url: string
	title: string
	description: string
	date: Date
}

function formatDate(date: Date) {
	return date
		.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
		.replace(/(\d+) (\w+) (\d+)/, '$1 $2, $3')
}

const BlogPostItem = ({ url, title, description, date }: Props) => {
	return (
		<li class="mb-8">
			<a href={url}>
				<h3 class="text-xl font-semibold sm:text-2xl">{title}</h3>
				<p class="my-2 text-sm sm:text-base">{description}</p>
				<span class="text-xs opacity-60 sm:text-sm">{formatDate(date)}</span>
			</a>
		</li>
	)
}

export default BlogPostItem
