import { useCallback, useEffect, useRef, useState } from 'react'
import flashcardService from '../services/flashcard.service'

export function useFlashcardLibrary() {
  const [decks, setDecks] = useState([])
  const [cardsByDeck, setCardsByDeck] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchDecks() {
      // Try to get userId - retry a few times in case auth hasn't populated yet
      let uid = window.localStorage.getItem('userId')
      if (!uid) {
        // Wait 500ms and try again
        await new Promise((r) => setTimeout(r, 500))
        uid = window.localStorage.getItem('userId')
      }
      if (!uid) {
        // Wait another 1s
        await new Promise((r) => setTimeout(r, 1000))
        uid = window.localStorage.getItem('userId')
      }

      console.log('[useFlashcardLibrary] userId:', uid)

      if (!uid) {
        if (!cancelled) {
          setDecks([])
          setLoading(false)
        }
        return
      }

      try {
        if (!cancelled) setLoading(true)
        const data = await flashcardService.getHistory(uid)
        if (cancelled) return
        
        console.log('[useFlashcardLibrary] response:', JSON.stringify(data).substring(0, 200))
        const flashcards = data.flashcards || data.cards || data || []
        console.log('[useFlashcardLibrary] count:', flashcards.length)

        if (flashcards.length > 0) {
          const chatCards = flashcards.filter((fc) => fc.source === 'chat-inline')
          const aiCards = flashcards.filter((fc) => fc.source === 'ai')
          const seedCards = flashcards.filter((fc) => fc.source === 'seed')
          const otherCards = flashcards.filter((fc) => !['chat-inline', 'ai', 'seed'].includes(fc.source))
          const recentCards = [...flashcards]
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 20)

          const collections = []
          const byDeck = {}

          collections.push({
            id: 'recent',
            title: 'Recent',
            category: 'Latest',
            count: recentCards.length,
            progress: Math.round((recentCards.filter((c) => c.reviewed_at).length / recentCards.length) * 100),
          })
          byDeck.recent = recentCards

          collections.push({
            id: 'all',
            title: 'All Vocabulary',
            category: 'All',
            count: flashcards.length,
            progress: Math.round((flashcards.filter((c) => c.reviewed_at).length / flashcards.length) * 100),
          })
          byDeck.all = flashcards

          if (chatCards.length > 0) {
            collections.push({
              id: 'chat-inline',
              title: 'Chat Flashcards',
              category: 'From Chat',
              count: chatCards.length,
              progress: Math.round((chatCards.filter((c) => c.reviewed_at).length / chatCards.length) * 100),
            })
            byDeck['chat-inline'] = chatCards
          }
          if (aiCards.length > 0) {
            collections.push({
              id: 'ai-generated',
              title: 'AI Generated',
              category: 'AI',
              count: aiCards.length,
              progress: Math.round((aiCards.filter((c) => c.reviewed_at).length / aiCards.length) * 100),
            })
            byDeck['ai-generated'] = aiCards
          }
          if (seedCards.length > 0) {
            collections.push({
              id: 'seed',
              title: 'Starter Pack',
              category: 'Demo',
              count: seedCards.length,
              progress: Math.round((seedCards.filter((c) => c.reviewed_at).length / seedCards.length) * 100),
            })
            byDeck.seed = seedCards
          }
          if (otherCards.length > 0) {
            collections.push({
              id: 'other',
              title: 'Other',
              category: 'General',
              count: otherCards.length,
              progress: 0,
            })
            byDeck.other = otherCards
          }

          setDecks(collections)
          setCardsByDeck(byDeck)
        } else {
          setDecks([])
          setCardsByDeck({})
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useFlashcardLibrary] Error:', err)
          setError(err.message)
          setDecks([])
          setCardsByDeck({})
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchDecks()
    return () => { cancelled = true }
  }, [])

  return { decks, cardsByDeck, loading, error }
}

export function useFlashcardStudyAPI(deckId = 'all') {
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
        setError(null)
        const data = await flashcardService.getHistory()
        const raw = data.flashcards || data.cards || data || []
        const sortedRecent = [...raw].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        let filtered = raw

        if (deckId === 'recent') {
          filtered = sortedRecent.slice(0, 20)
        } else if (deckId === 'chat-inline') {
          filtered = raw.filter((fc) => fc.source === 'chat-inline')
        } else if (deckId === 'ai-generated') {
          filtered = raw.filter((fc) => fc.source === 'ai')
        } else if (deckId === 'seed') {
          filtered = raw.filter((fc) => fc.source === 'seed')
        } else if (deckId === 'other') {
          filtered = raw.filter((fc) => !['chat-inline', 'ai', 'seed'].includes(fc.source))
        } else if (deckId === 'all') {
          filtered = raw
        }

        // Map API flashcard format to study card format
        const mapped = filtered.map((fc) => ({
          id: fc.id || fc._id,
          front: fc.word || fc.front,
          back: fc.meaning || fc.back,
          pos: fc.ipa || fc.pos || '',
          example: fc.example || '',
        }))
        setCards(mapped)
      } catch (err) {
        setError(err.message)
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [deckId])

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
