function Badge({ children, variant = 'default', className = '' }) {
  return <span className={['chip', `chip-${variant}`, className].filter(Boolean).join(' ')}>{children}</span>
}

export default Badge
