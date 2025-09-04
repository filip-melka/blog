import { useEffect, useMemo, useRef, useState } from 'react'
import clapImg from '../../assets/clap.svg'
import { clsx } from 'clsx'
import { debounce } from '../../utils'

enum State {
  loading,
  error,
  display,
}

type ClapButtonProps = {
  fetchClaps: () => Promise<number | Error>
  saveAddedClaps: (noOfAddedClaps: number) => void
}

function ClapButton({ fetchClaps, saveAddedClaps }: ClapButtonProps) {
  const [state, setState] = useState(State.loading)
  const [count, setCount] = useState(0)

  async function fetchCurrentClaps() {
    const currentClaps = await fetchClaps()
    if (typeof currentClaps === 'number') {
      setCount(currentClaps)
      setState(State.display)
    } else {
      setState(State.error)
    }
  }

  useEffect(() => {
    fetchCurrentClaps()
  }, [])

  return (
    <div className="text-text not-prose flex items-center gap-2">
      <Clap
        saveClaps={saveAddedClaps}
        addClap={() => setCount((currentCount) => currentCount + 1)}
      />
      {state === State.loading ? <Sceleton /> : <Count count={count} />}
    </div>
  )
}

export default ClapButton

type ClapProps = {
  addClap: () => void
  saveClaps: (noOfAddedClaps: number) => void
}

function Clap({ addClap, saveClaps }: ClapProps) {
  const [isBubbleVisible, setIsBubbleVisible] = useState(false)
  const [noOfAddedClaps, setNoOfAddedClaps] = useState(0)
  const noOfAddedClapsRef = useRef(noOfAddedClaps)
  useEffect(() => {
    noOfAddedClapsRef.current = noOfAddedClaps
  }, [noOfAddedClaps])

  const debouncedHandler = useMemo(
    () =>
      debounce(() => {
        saveClaps(noOfAddedClapsRef.current)
        setIsBubbleVisible(false)
        setNoOfAddedClaps(0)
      }, 2000),
    []
  )

  useEffect(() => {
    if (noOfAddedClaps > 0) {
      setIsBubbleVisible(true)
      debouncedHandler()
    }
  }, [noOfAddedClaps])

  function handleClick() {
    setNoOfAddedClaps((currentCount) => currentCount + 1)
    addClap()
  }

  return (
    <>
      <button
        disabled={noOfAddedClaps >= 10}
        onClick={handleClick}
        className="group relative cursor-pointer rounded-full p-2 disabled:cursor-default"
      >
        <img
          src={clapImg}
          alt="Clap"
          className="h-8 transition-transform duration-200 group-hover:scale-110"
        />
        <div
          className={clsx(
            'centered bg-text/10 absolute -top-9 left-2 h-9 w-9 animate-bounce rounded-full transition-transform duration-300',
            {
              'text-text scale-100': isBubbleVisible,
              'scale-0 text-transparent': !isBubbleVisible,
            }
          )}
        >
          +{noOfAddedClaps}
        </div>
      </button>
    </>
  )
}

type CountProps = {
  count: number
}

function Count({ count }: CountProps) {
  return <div className="text-lg">{count}</div>
}

function Sceleton() {
  return <div className="skeleton h-6 w-12"></div>
}
