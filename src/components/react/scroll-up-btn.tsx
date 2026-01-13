import { ChevronUp } from "lucide-react"

export function ScrollUpBtn() {
  return (
    <a
      href="#"
      className="sticky bottom-20 z-10 inline-flex h-fit w-fit items-center justify-center"
    >
      <button className="cursor-pointer rounded-full p-0">
        <ChevronUp
          className="text-text scale-75 transition-transform hover:scale-100"
          size={50}
        />
      </button>
    </a>
  )
}
