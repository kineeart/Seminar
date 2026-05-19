import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { useFlashcardStudyAPI } from '../hooks/useFlashcards'
import useSwipe from '../hooks/useSwipe'

function FlashcardStudyPage() {
  const demo = useFlashcardStudyAPI()

  const swipe = useSwipe({
    onSwipeRight: demo.markKnown,
    onSwipeLeft: demo.markUnknown,
    onTap: demo.flip,
  })

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      demo.flip()
    } else if (event.key === 'ArrowRight') {
      demo.markKnown()
    } else if (event.key === 'ArrowLeft') {
      demo.markUnknown()
    }
  }

  if (demo.loading) {
    return (
      <MainLayout className="study-shell">
        <div className="loading-spinner"><div className="spinner" /><p>Loading flashcards...</p></div>
      </MainLayout>
    )
  }

  if (demo.finished) {
    return (
      <MainLayout className="study-shell">
        <div className="card-base finish-screen">
          <h2>🎉 All done!</h2>
          <p>You got <strong style={{ color: '#27ae60' }}>{demo.known}</strong> correct and <strong style={{ color: '#e74c3c' }}>{demo.unknown}</strong> wrong.</p>
          <Button to="/flashcards">Back to Library</Button>
          <Button variant="ghost" onClick={demo.restart}>Restart</Button>
        </div>
      </MainLayout>
    )
  }

  const progressPercent = demo.total > 0 ? Math.round(((demo.known + demo.unknown) / demo.total) * 100) : 0

  // Build card class
  const cardClass = [
    'study-card',
    demo.flipped ? 'flipped' : '',
    swipe.swiped === 'right' ? 'swipe-right-anim' : '',
    swipe.swiped === 'left' ? 'swipe-left-anim' : '',
    swipe.dragging ? 'dragging' : '',
  ].filter(Boolean).join(' ')

  return (
    <MainLayout className="study-shell">
      <header style={{ textAlign: 'center', width: '100%' }}>
        <h1>✨ Vocabulary Flashcards</h1>
        <div style={{ marginTop: '14px' }}>
          <div className="between" style={{ fontSize: '13px', marginBottom: '8px' }}>
            <span>{demo.known + demo.unknown} / {demo.total} words learned</span>
            <span>✓ {demo.known}  ✗ {demo.unknown}</span>
          </div>
          <ProgressBar value={progressPercent} />
        </div>
      </header>

      {/* Card area — swipe handlers on wrapper */}
      <div className="study-card-area" {...swipe.handlers}>
        {/* Overlays outside card so they don't flip */}
        <div className="swipe-overlay correct" style={{ opacity: swipe.showCorrect }}>KNOW ✓</div>
        <div className="swipe-overlay wrong" style={{ opacity: swipe.showWrong }}>DON'T KNOW ✗</div>

        {/* Current card — key forces remount on index change */}
        <div
          key={`card-${demo.index}`}
          className={cardClass}
          style={swipe.dragging ? swipe.cardStyle : {}}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
        >
          <div className="study-face front">
            <div className="study-word">{demo.current?.front}</div>
            <div className="study-pos">{demo.current?.pos || 'word'}</div>
            <div className="study-hint">Tap to flip · Drag to answer</div>
          </div>
          <div className="study-face back">
            <div className="study-word-small">{demo.current?.front}</div>
            <div className="study-meaning">{demo.current?.back}</div>
            {demo.current?.example && <p className="study-example">"{demo.current.example}"</p>}
            <div className="study-hint">Tap to flip back</div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="study-dots">
        {Array.from({ length: demo.total }).map((_, i) => (
          <span key={i} className={i === demo.index ? 'dot active' : i < demo.index ? 'dot done' : 'dot'} />
        ))}
      </div>

      {/* Buttons */}
      <div className="study-buttons">
        <button className="btn red" onClick={demo.markUnknown}>✗ Don't Know</button>
        <button className="btn green" onClick={demo.markKnown}>✓ Know</button>
      </div>
    </MainLayout>
  )
}

export default FlashcardStudyPage
