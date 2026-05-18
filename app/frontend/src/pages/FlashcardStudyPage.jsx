import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import useFlashcardStudy from '../hooks/useFlashcardStudy'

function FlashcardStudyPage() {
  const demo = useFlashcardStudy()

  if (demo.finished) {
    return (
      <MainLayout className="study-shell">
        <Card className="finish-card">
          <h1>Great job!</h1>
          <p>You reviewed {demo.total} cards.</p>
          <div className="result-row">
            <span>Know</span>
            <strong>{demo.known}</strong>
          </div>
          <div className="result-row">
            <span>Don't know</span>
            <strong>{demo.unknown}</strong>
          </div>
          <Button to="/dashboard">Back to home</Button>
          <Button variant="ghost" onClick={demo.restart}>Restart</Button>
        </Card>
      </MainLayout>
    )
  }

  return (
    <MainLayout className="study-shell">
      <header className="study-header">
        <span>Card {demo.index + 1} / {demo.total}</span>
        <div className="dot-row">
          {Array.from({ length: demo.total }).map((_, i) => <span key={i} className={i === demo.index ? 'active' : ''} />)}
        </div>
      </header>

      <Card className={['flashcard', demo.swipeDir === 'right' ? 'swipe-right' : demo.swipeDir === 'left' ? 'swipe-left' : '', demo.flipped ? 'flipped' : ''].filter(Boolean).join(' ')} onClick={demo.flip}>
        <div className="card-front">
          <h2>{demo.current?.front}</h2>
          <small>Tap to reveal</small>
        </div>
        <div className="card-back">
          <p>{demo.current?.back}</p>
          <small className="example">{demo.current?.example}</small>
        </div>
      </Card>

      <div className="study-actions">
        <Button variant="danger" onClick={demo.markUnknown}>Don't Know</Button>
        <Button variant="success" onClick={demo.markKnown}>Know</Button>
      </div>
    </MainLayout>
  )
}

export default FlashcardStudyPage