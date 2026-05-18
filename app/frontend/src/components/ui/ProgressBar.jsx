function ProgressBar({ value, max = 100, className = '' }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div className={['progress-bar', className].filter(Boolean).join(' ')} aria-valuemin="0" aria-valuemax={max} aria-valuenow={value} role="progressbar">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}

export default ProgressBar
