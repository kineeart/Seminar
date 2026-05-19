import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { useFlashcardLibrary } from '../hooks/useFlashcards'

const DECK_COLORS = ['#6a82fb', '#fc5c7d', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c']

function FlashcardLibraryPage() {
  const navigate = useNavigate()
  const { decks, cardsByDeck, loading, error } = useFlashcardLibrary()
  const [selectedDeckId, setSelectedDeckId] = useState('recent')

  const selectedCards = useMemo(() => {
    if (!selectedDeckId) return []
    return cardsByDeck[selectedDeckId] || []
  }, [cardsByDeck, selectedDeckId])

  const totalDue = decks.reduce((sum, d) => {
    if (d.id === 'all') return sum // skip "all" to avoid double counting
    const unreviewed = d.count - Math.floor(d.count * (d.progress || 0) / 100)
    return sum + unreviewed
  }, 0)

  return (
    <MainLayout navActive="cards" className="library-shell">
      <header className="between">
        <div>
          <p className="muted">My Library</p>
          <h1>Flashcards 🃏</h1>
        </div>
        <button className="new-session-btn" title="Add collection">+</button>
      </header>

      <input placeholder="🔍 Search collections..." />

      <div className="filter-chips">
        {['All', 'TOEIC', 'IELTS', 'Grammar', 'Vocabulary'].map((chip, i) => (
          <button key={chip} className={i === 0 ? 'filter-chip filter-chip-active' : 'filter-chip'} type="button">{chip}</button>
        ))}
      </div>

      {/* Due today card */}
      <div className="card-base due-today-card">
        <p style={{ opacity: 0.9, fontSize: '12px', fontWeight: 700 }}>⏰ DUE TODAY</p>
        <h2 style={{ color: '#fff', marginTop: '4px' }}>{totalDue} cards to review</h2>
        <Button variant="ghost" to="/flashcards/study" className="btn-inline" style={{ marginTop: '14px', color: '#fc5c7d' }}>
          Review now →
        </Button>
      </div>

      {/* Collections */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>
      ) : error ? (
        <div className="card-base" style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#e74c3c' }}>Error: {error}</p>
        </div>
      ) : decks.length === 0 ? (
        <div className="card-base" style={{ textAlign: 'center', padding: '30px' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
          <h3>No flashcards yet</h3>
          <p className="muted" style={{ marginTop: '6px' }}>Go to Chat and ask AI to create flashcards for you!</p>
          <Button to="/chat" className="btn-inline" style={{ marginTop: '14px' }}>
            Create in Chat →
          </Button>
        </div>
      ) : (
        <div>
          <h3 style={{ marginBottom: '10px' }}>Collections</h3>
          <div className="col">
            {decks.map((deck, idx) => (
              <button
                key={deck.id || deck._id || idx}
                type="button"
                className={`card-base deck-pick ${selectedDeckId === deck.id ? 'deck-pick-active' : ''}`}
                onClick={() => {
                  setSelectedDeckId(deck.id)
                  navigate(`/flashcards/study?deck=${encodeURIComponent(deck.id)}`)
                }}
              >
                <div className="between">
                  <div>
                    <h3>{deck.title}</h3>
                    <p className="muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                      {deck.category || 'General'} · {deck.count || 0} cards
                    </p>
                  </div>
                  <div className="deck-icon" style={{ background: DECK_COLORS[idx % DECK_COLORS.length] }}>🃏</div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <ProgressBar value={deck.progress || 0} />
                </div>
                <p className="muted" style={{ fontSize: '11px', marginTop: '6px' }}>{deck.progress || 0}% mastered</p>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '14px' }}>
            <h3 style={{ marginBottom: '8px' }}>{selectedDeckId === 'recent' ? 'Recent Words' : 'Words'}</h3>
            {selectedCards.length === 0 ? (
              <div className="card-base">
                <p className="muted">No words in this collection.</p>
              </div>
            ) : (
              <div className="col">
                {selectedCards.map((card, idx) => (
                  <div key={card.id || card._id || `${card.word}-${idx}`} className="card-base">
                    <div className="between">
                      <h3 style={{ margin: 0 }}>{card.word}</h3>
                      <span className="muted" style={{ fontSize: '12px' }}>{card.ipa || ''}</span>
                    </div>
                    <p style={{ marginTop: '8px' }}>{card.meaning}</p>
                    {card.example ? <p className="muted" style={{ marginTop: '6px', fontStyle: 'italic' }}>{card.example}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default FlashcardLibraryPage
