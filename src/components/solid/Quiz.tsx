import { createSignal, onMount } from 'solid-js'

function shuffleArray(array: string[]) {
	for (var i = array.length - 1; i >= 0; i--) {
		var j = Math.floor(Math.random() * (i + 1))
		var temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}

	return array
}

interface Question {
	question: string
	correctAnswer: string
	options: string[]
}

type QuestionProps = {
	question: Question
	index: number
}

const Question = ({ question, index }: QuestionProps) => {
	const [selectedAnswer, setSelectedAnswer] = createSignal('')
	const [options, setOptions] = createSignal<string[]>([])

	onMount(() => {
		setOptions(shuffleArray([question.correctAnswer, ...question.options]))
	})

	function handleClick(selectedOption: string) {
		setSelectedAnswer(selectedOption)
	}

	return (
		<div>
			<p>
				<span class="pr-2">{index}.</span>
				{question.question}
			</p>
			<div>
				<ul class="mt-4 mb-0! list-none!">
					{options().map((option) => (
						<li>
							<button
								class={`mt-2 w-full cursor-pointer rounded px-3 py-3 text-left text-xs sm:mt-3 sm:px-6 sm:text-base ${
									selectedAnswer() !== option
										? 'bg-quiz-option opacity-70 transition-opacity duration-100 hover:opacity-100'
										: selectedAnswer() !== question.correctAnswer
											? 'bg-red-300 text-red-900'
											: 'bg-green-300 text-green-900'
								}`}
								onClick={() => handleClick(option)}
							>
								{option}
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

type QuizProps = {
	questions: Question[]
}

const Quiz = ({ questions }: QuizProps) => {
	return (
		<div class="post-block quiz bg-text/5 flex flex-col gap-6 p-8">
			{questions.map((question, index) => (
				<Question question={question} index={index + 1} />
			))}
		</div>
	)
}

export default Quiz
