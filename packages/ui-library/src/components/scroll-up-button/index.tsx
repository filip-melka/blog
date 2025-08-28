import { ChevronUp } from 'lucide-react'

function ScrollUpButton() {
  return (
    <button className="cursor-pointer rounded-full">
      <ChevronUp
        className="text-text scale-75 transition-transform hover:scale-100"
        size={50}
      />
    </button>
  )
}

export default ScrollUpButton
