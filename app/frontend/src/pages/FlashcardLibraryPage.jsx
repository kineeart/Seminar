import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { useFlashcardLibrary } from '../hooks/useFlashcards'

const DECK_COLORS = ['#6a82fb', '#fc5c7d', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c']

function FlashcardLibraryPage() {
  const { decks, loading } = useFlashcardLibrary()

  const totalDue = decks.reduce((sum, d) => sum + (d.due || Math.floor(d.count * (1 - (d.progress || 0) / 100))), 0)

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
      ) : (
        <div>
          <h3 style={{ marginBottom: '10px' }}>Collections</h3>
          <div className="col">
            {decks.map((deck, idx) => (
              <div key={deck.id || deck._id || idx} className="card-base">
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
              </div>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default FlashcardLibraryPage
