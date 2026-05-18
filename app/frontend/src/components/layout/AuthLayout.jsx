function AuthLayout({ children, className = '' }) {
  return (
    <main className="app-page">
      <div className={['app-shell fade-in', className].filter(Boolean).join(' ')}>{children}</div>
    </main>
  )
}

export default AuthLayout
