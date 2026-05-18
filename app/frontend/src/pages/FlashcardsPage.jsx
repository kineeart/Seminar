import { useState } from 'react'
import FlashcardGrid from '../components/FlashcardGrid'
import ReviewProgress from '../components/ReviewProgress'
import '../styles/flashcards.css'

export default function FlashcardsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [flashcards, setFlashcards] = useState([])

  async function handleGenerate(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const conv = [{ role: 'user', content: 'Explain maintain and productivity.' }]
    try {
      const res = await fetch('/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: `local_${Date.now()}`, messages: conv })
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      setFlashcards(data.flashcards || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flashcards-page">
      <div className="toolbar">
        <h2>AI Flashcards</h2>
        <button className="btn" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate from Conversation'}
        </button>
      </div>
      <ReviewProgress total={flashcards.length} />
      {error && <div className="error">Error: {error}</div>}
      <FlashcardGrid cards={flashcards} />
      {flashcards.length === 0 && !loading && <div className="empty">No flashcards yet. Click generate.</div>}
    </main>
  )
}
