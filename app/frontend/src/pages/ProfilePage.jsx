import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProgressBar from '../components/ui/ProgressBar'
import { useAuth } from '../contexts/AuthContext'
import useProfile from '../hooks/useProfile'

function ProfilePage() {
  const { user, logout } = useAuth()
  const { profile, loading } = useProfile()

  const displayName = profile?.name || user?.name || 'User'
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  if (loading) {
    return (
      <MainLayout navActive="profile">
        <LoadingSpinner text="Loading profile..." />
      </MainLayout>
    )
  }

  return (
    <MainLayout navActive="profile">
      <header className="page-header row-between">
        <div>
          <h1>{displayName}</h1>
          <p>{profile?.level || 'Intermediate'} · Target: {profile?.target || 'General English'}</p>
        </div>
        <div className="avatar">{initials}</div>
      </header>

      <section className="stats-grid">
        {(profile?.stats || []).map((item) => (
          <Card key={item.label} className="stat-card">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </Card>
        ))}
      </section>

      {profile?.weekly?.length > 0 && (
        <Card>
          <h2>Weekly activity</h2>
          <div className="weekly-chart">
            {profile.weekly.map((value, idx) => (
              <div key={idx} className="week-bar-wrap" aria-label={`Day ${idx + 1}: ${value}`}>
                <span className="week-bar" style={{ height: `${Math.max(18, value)}px` }} />
                <span className="week-tooltip">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {profile?.skills?.length > 0 && (
        <section className="section-stack">
          <h2>Skills</h2>
          {profile.skills.map((skill) => (
            <Card key={skill.label} className="deck-row">
              <div>
                <strong>{skill.label}</strong>
              </div>
              <ProgressBar value={skill.value} />
            </Card>
          ))}
        </section>
      )}

      <div className="action-row" style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={logout} type="button">Log out</button>
      </div>
    </MainLayout>
  )
}

export default ProfilePage
