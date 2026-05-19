import { useCallback, useEffect, useRef, useState } from 'react'
import flashcardService from '../services/flashcard.service'

const FALLBACK_DECKS = [
  { id: 'toeic', title: 'TOEIC Vocabulary', category: 'TOEIC', count: 124, progress: 68 },
  { id: 'ielts', title: 'IELTS Writing', category: 'IELTS', count: 42, progress: 35 },
  { id: 'grammar', title: 'Grammar Essentials', category: 'Grammar', count: 75, progress: 76 },
  { id: 'daily', title: 'Daily Phrases', category: 'Vocabulary', count: 58, progress: 42 },
]

const FALLBACK_CARDS = [
  { id: 1, front: 'acquire', back: 'đạt được, thu được', example: 'She acquired new skills quickly.' },
  { id: 2, front: 'deadline', back: 'hạn chót', example: 'The application deadline is Friday.' },
  { id: 3, front: 'negotiate', back: 'đàm phán', example: 'They negotiated a better contract.' },
  { id: 4, front: 'reliable', back: 'đáng tin cậy', example: 'This method is reliable for beginners.' },
  { id: 5, front: 'implement', back: 'thực hiện, triển khai', example: 'We need to implement the new policy.' },
  { id: 6, front: 'collaborate', back: 'hợp tác', example: 'Teams collaborate on large projects.' },
  { id: 7, front: 'efficient', back: 'hiệu quả', example: 'This is a more efficient approach.' },
  { id: 8, front: 'revenue', back: 'doanh thu', example: 'The company increased its revenue by 20%.' },
]

export function useFlashcardLibrary() {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDecks() {
      try {
        setLoading(true)
        const data = await flashcardService.getHistory()
        const result = data.decks || data.history || data || []
        setDecks(result.length > 0 ? result : FALLBACK_DECKS)
      } catch {
        setDecks(FALLBACK_DECKS)
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
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const advanceTimerRef = useRef(null)

  useEffect(() => {
    async function fetchCards() {
      try {
        setLoading(true)
        const data = await flashcardService.getHistory()
        const allCards = data.cards || data.flashcards || data || []
        setCards(allCards.length > 0 ? allCards : FALLBACK_CARDS)
      } catch {
        setCards(FALLBACK_CARDS)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  const current = cards[index]
  const total = cards.length
  const SWIPE_ANIMATION_MS = 460

  const flip = () => setFlipped((f) => !f)

  const advanceAfterSwipe = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
    }

    advanceTimerRef.current = setTimeout(() => {
      if (index + 1 < total) {
        setIndex((i) => i + 1)
      } else {
        setFinished(true)
      }
      setFlipped(false)
    }, SWIPE_ANIMATION_MS)
  }, [index, total])

  const markKnown = useCallback(() => {
    setKnown((k) => k + 1)
    if (current?.id || current?._id) {
      flashcardService.markReviewed(current.id || current._id, true).catch(() => {})
    }
    advanceAfterSwipe()
  }, [current, advanceAfterSwipe])

  const markUnknown = useCallback(() => {
    setUnknown((u) => u + 1)
    if (current?.id || current?._id) {
      flashcardService.markReviewed(current.id || current._id, false).catch(() => {})
    }
    advanceAfterSwipe()
  }, [current, advanceAfterSwipe])

  const restart = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
    }
    setIndex(0)
    setFlipped(false)
    setKnown(0)
    setUnknown(0)
    setFinished(false)
  }

  useEffect(() => () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
    }
  }, [])

  return { cards, current, index, total, flipped, known, unknown, finished, flip, markKnown, markUnknown, restart, loading, error }
}
