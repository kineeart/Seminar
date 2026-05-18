import Flashcard from './Flashcard'

export default function FlashcardGrid({ cards }) {
  return (
    <div className="grid">
      {cards.map((c) => (
        <Flashcard key={c.id || c.word} card={c} />
      ))}
    </div>
  )
}
