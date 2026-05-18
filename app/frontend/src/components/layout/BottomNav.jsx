import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠', key: 'home' },
  { to: '/chat', label: 'Chat', icon: '💬', key: 'chat' },
  { to: '/flashcards', label: 'Cards', icon: '🃏', key: 'cards' },
  { to: '/quiz', label: 'Quiz', icon: '🎯', key: 'quiz' },
  { to: '/profile', label: 'Profile', icon: '👤', key: 'profile' },
]

function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          className={({ isActive }) => (isActive || active === item.key ? 'nav-item active' : 'nav-item')}
          to={item.to}
        >
          <span className="ico">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
