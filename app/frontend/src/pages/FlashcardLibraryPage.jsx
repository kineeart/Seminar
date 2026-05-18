import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import { flashcardDecks } from '../data/mockFlashcards'

function FlashcardLibraryPage() {
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

      <Card className="review-card">
        <strong>Due today</strong>
        <span>Review TOEIC Vocabulary</span>
        <ProgressBar value={18} />
        <Button size="sm" to="/flashcards/study">Study</Button>
      </Card>

      <section className="deck-list">
        {flashcardDecks.map((deck) => (
          <Card key={deck.id} className="deck-card">
            <div>
              <strong>{deck.title}</strong>
              <small>{deck.count} cards · {deck.progress}% mastered</small>
              <ProgressBar value={deck.progress} />
            </div>
            <Button size="sm" to="/flashcards/study">Study</Button>
          </Card>
        ))}
      </section>
    </MainLayout>
  )
}

export default FlashcardLibraryPage