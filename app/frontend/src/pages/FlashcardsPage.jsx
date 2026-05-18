import { useEffect, useState } from 'react'
import FlashcardGrid from '../components/FlashcardGrid'
import ReviewProgress from '../components/ReviewProgress'
import '../styles/flashcards.css'

export default function FlashcardsPage() {
  const userId = window.localStorage.getItem('userId') || 'guest'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      const res = await fetch(`/api/flashcards/history?userId=${encodeURIComponent(userId)}&limit=12`)
      if (!res.ok) return
      const data = await res.json()
      setHistory(data.flashcards || [])
    } catch (err) {
      // Ignore history load errors to keep the page usable.
    }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const conv = [{ role: 'user', content: 'Explain maintain and productivity.' }]
    try {
      const res = await fetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: `local_${Date.now()}`,
          userId,
          messages: conv,
        })
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      setFlashcards(data.flashcards || [])
      loadHistory()
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

      <section className="history-panel">
        <div className="history-header">
          <h3>Flashcard History</h3>
          <span>{history.length} saved</span>
        </div>
        {history.length === 0 && <div className="empty">No history yet.</div>}
        <div className="history-grid">
          {history.map((card) => (
            <div key={card.id || card.word} className="history-card">
              <div>
                <p className="history-word">{card.word}</p>
                <p className="history-meaning">{card.meaning}</p>
              </div>
              <span className="history-meta">{card.created_at?.slice(0, 10) || 'New'}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
