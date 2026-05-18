import { useState } from 'react'
import { studyCards } from '../data/mockFlashcards'

export default function useFlashcardStudy() {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [unknown, setUnknown] = useState(0)
  const [swipeDir, setSwipeDir] = useState(null)
  const [finished, setFinished] = useState(false)

  const current = studyCards[index]
  const total = studyCards.length

  const flip = () => setFlipped((f) => !f)

  const markKnown = () => {
    setSwipeDir('right')
    setKnown((k) => k + 1)
    advance()
  }

  const markUnknown = () => {
    setSwipeDir('left')
    setUnknown((u) => u + 1)
    advance()
  }

  const advance = () => {
    setTimeout(() => {
      setSwipeDir(null)
      setFlipped(false)
      if (index + 1 < total) {
        setIndex((i) => i + 1)
      } else {
        setFinished(true)
      }
    }, 250)
  }

  const restart = () => {
    setIndex(0)
    setFlipped(false)
    setKnown(0)
    setUnknown(0)
    setFinished(false)
    setSwipeDir(null)
  }

  return { current, index, total, flipped, known, unknown, finished, swipeDir, flip, markKnown, markUnknown, restart }
}