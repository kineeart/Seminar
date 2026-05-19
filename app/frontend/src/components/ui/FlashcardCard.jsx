/**
 * FlashcardCard - Renders a single flashcard inline in the chat.
 * Displays word (bold), IPA (italic), meaning, and example.
 */
function FlashcardCard({ flashcard }) {
  if (!flashcard || !flashcard.word) return null

  return (
    <div className="flashcard-inline-card">
      <div className="flashcard-inline-header">
        <span className="flashcard-inline-icon" aria-hidden="true">📇</span>
        <strong className="flashcard-inline-word">{flashcard.word}</strong>
        <em className="flashcard-inline-ipa">{flashcard.ipa}</em>
      </div>
      <div className="flashcard-inline-meaning">
        <span className="flashcard-inline-label">Nghĩa:</span> {flashcard.meaning}
      </div>
      <div className="flashcard-inline-example">
        <span className="flashcard-inline-label">Ví dụ:</span> <em>{flashcard.example}</em>
      </div>
    </div>
  )
}

export default FlashcardCard
