import BottomNav from './BottomNav'

function MainLayout({ children, navActive, className = '' }) {
  return (
    <main className="app-page">
      <div className={['app-shell main-shell fade-in', className].filter(Boolean).join(' ')}>
        {children}
        <BottomNav active={navActive} />
      </div>
    </main>
  )
}

export default MainLayout
