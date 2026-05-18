import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import { profile } from '../data/mockProfile'

function ProfilePage() {
  return (
    <MainLayout navActive="profile">
      <header className="page-header row-between">
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.level} ・ Target: {profile.target}</p>
        </div>
        <div className="avatar">HP</div>
      </header>

      <section className="stats-grid">
        {profile.stats.map((item) => (
          <Card key={item.label} className="stat-card">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </Card>
        ))}
      </section>

      <Card>
        <h2>Weekly activity</h2>
        <div className="weekly-chart">
          {profile.weekly.map((value, idx) => (
            <div key={idx} className="week-bar-wrap">
              <span className="week-bar" style={{ height: `${Math.max(18, value)}px` }} />
            </div>
          ))}
        </div>
      </Card>

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
    </MainLayout>
  )
}

export default ProfilePage

