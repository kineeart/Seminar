import { useCallback, useEffect, useState } from 'react'
import flashcardService from '../services/flashcard.service'

export function useFlashcardLibrary() {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDecks() {
      try {
        setLoading(true)
        const data = await flashcardService.getHistory()
        setDecks(data.decks || data.history || data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDecks()
  }, [])

  return { decks, loading, error }
}

export function useFlashcardStudyAPI() {
  const [cards, setCards] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [unknown, setUnknown] = useState(0)
  const [swipeDir, setSwipeDir] = useState(null)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true)
        const data = await flashcardService.getHistory()
        const allCards = data.cards || data.flashcards || data || []
        setCards(allCards)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const current = cards[index]
  const total = cards.length

  const flip = () => setFlipped((f) => !f)

  const markKnown = useCallback(() => {
    setSwipeDir('right')
    setKnown((k) => k + 1)
    if (current?.id || current?._id) {
      flashcardService.markReviewed(current.id || current._id, true).catch(() => {})
    }
    setTimeout(() => {
      setSwipeDir(null)
      setFlipped(false)
      if (index + 1 < total) {
        setIndex((i) => i + 1)
      } else {
        setFinished(true)
      }
    }, 250)
  }, [current, index, total])

  const markUnknown = useCallback(() => {
    setSwipeDir('left')
    setUnknown((u) => u + 1)
    if (current?.id || current?._id) {
      flashcardService.markReviewed(current.id || current._id, false).catch(() => {})
    }
    setTimeout(() => {
      setSwipeDir(null)
      setFlipped(false)
      if (index + 1 < total) {
        setIndex((i) => i + 1)
      } else {
        setFinished(true)
      }
    }, 250)
  }, [current, index, total])

  const restart = () => {
    setIndex(0)
    setFlipped(false)
    setKnown(0)
    setUnknown(0)
    setFinished(false)
    setSwipeDir(null)
  }

  return { current, index, total, flipped, known, unknown, finished, swipeDir, flip, markKnown, markUnknown, restart, loading, error }
}
