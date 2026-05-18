export default function ReviewProgress({ total = 0 }) {
  return (
    <div className="progress">
      <div className="count">Flashcards: {total}</div>
      <div className="bar"><div className="fill" style={{ width: `${Math.min(100, total * 10)}%` }} /></div>
    </div>
  )
}
