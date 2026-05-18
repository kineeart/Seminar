import BottomNav from './BottomNav'

function MainLayout({ children, navActive, className = '' }) {
  return (
    <main className="app-page">
      <div className={['app-shell main-shell', className].filter(Boolean).join(' ')}>
        <div className="main-content fade-in">
          {children}
        </div>
        <BottomNav active={navActive} />
      </div>
    </main>
  )
}

export default MainLayout
