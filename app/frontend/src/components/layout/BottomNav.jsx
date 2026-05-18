import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: 'HOME', key: 'home' },
  { to: '/chat', label: 'Chat', icon: 'CHAT', key: 'chat' },
  { to: '/flashcards', label: 'Cards', icon: 'CARD', key: 'cards' },
  { to: '/quiz', label: 'Quiz', icon: 'QUIZ', key: 'quiz' },
  { to: '/profile', label: 'Profile', icon: 'USER', key: 'profile' },
]

function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          className={({ isActive }) => (isActive || active === item.key ? 'bottom-nav-item active' : 'bottom-nav-item')}
          to={item.to}
        >
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
