import { useState } from 'react'

export default function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
      <div className="front">
        <div className="word">{card.word}</div>
        <div className="ipa">{card.ipa}</div>
      </div>
      <div className="back">
        <div className="meaning">{card.meaning}</div>
        <div className="example">{card.example}</div>
      </div>
    </div>
  )
}
