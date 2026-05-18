import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProgressBar from '../components/ui/ProgressBar'
import { useFlashcardLibrary } from '../hooks/useFlashcards'

function FlashcardLibraryPage() {
  const { decks, loading } = useFlashcardLibrary()

  return (
    <MainLayout navActive="cards" className="library-shell">
      <header className="page-header row-between">
        <h1>My Library</h1>
        <Button size="sm" to="/flashcards/study">Add</Button>
      </header>

      <div className="search-row">
        <input placeholder="Search decks..." />
      </div>

      <div className="filter-chips">
        {['All', 'TOEIC', 'IELTS', 'Grammar', 'Vocabulary'].map((chip) => <button key={chip} className="filter-chip" type="button">{chip}</button>)}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading library..." />
      ) : (
        <>
          {decks.length > 0 && (
            <Card className="review-card">
              <strong>Due today</strong>
              <span>Review {decks[0]?.title || 'flashcards'}</span>
              <ProgressBar value={decks[0]?.due || 0} />
              <Button size="sm" to="/flashcards/study">Study</Button>
            </Card>
          )}

          <section className="deck-list">
            {decks.length === 0 ? (
              <Card className="deck-card">
                <p>No decks yet. Start a chat to generate flashcards.</p>
                <Button size="sm" to="/chat">Go to AI Chat</Button>
              </Card>
            ) : (
              decks.map((deck) => (
                <Card key={deck.id || deck._id} className="deck-card">
                  <div>
                    <strong>{deck.title}</strong>
                    <small>{deck.count || 0} cards · {deck.progress || 0}% mastered</small>
                    <ProgressBar value={deck.progress || 0} />
                  </div>
                  <Button size="sm" to="/flashcards/study">Study</Button>
                </Card>
              ))
            )}
          </section>
        </>
      )}
    </MainLayout>
  )
}

export default FlashcardLibraryPage
