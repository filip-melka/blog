import { ChevronUp } from "lucide-react"

export function ScrollUpBtn() {
  return (
    <a href="#" className="cursor-pointe sticky bottom-20 z-10 block w-fit">
      <button className="cursor-pointer rounded-full">
        <ChevronUp
          className="text-text scale-75 transition-transform hover:scale-100"
          size={50}
        />
      </button>
    </a>
  )
}
