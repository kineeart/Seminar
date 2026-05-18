import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import { dashboardStats, recentDecks, recommendations } from '../data/mockDashboard'

function DashboardPage() {
  return (
    <MainLayout navActive="home">
      <header className="page-header row-between">
        <div>
          <span className="chip">Today</span>
          <h1>Hi, Hao</h1>
          <p>Ready for a smart English session?</p>
        </div>
        <div className="avatar">HP</div>
      </header>

      <section className="stats-grid">
        {dashboardStats.map((stat) => <Card key={stat.label} className="stat-card"><strong>{stat.value}</strong><span>{stat.label}</span></Card>)}
      </section>

      <Card className="continue-card card-gradient">
        <span>Continue learning</span>
        <h2>TOEIC Vocabulary - Set 3</h2>
        <ProgressBar value={68} />
        <Button to="/flashcards/study">Resume</Button>
      </Card>

      <section className="section-stack">
        <h2>Recent flashcards</h2>
        {recentDecks.map((deck) => (
          <Card key={deck.title} className="deck-row">
            <div><strong>{deck.title}</strong><small>{deck.meta}</small></div>
            <ProgressBar value={deck.progress} />
          </Card>
        ))}
      </section>

      <section className="section-stack">
        <h2>Recommended</h2>
        {recommendations.map((item) => <Card interactive key={item.title} className="action-card"><div><strong>{item.title}</strong><small>{item.detail}</small></div><Button size="sm" to={item.to}>Start</Button></Card>)}
      </section>
    </MainLayout>
  )
}

export default DashboardPage
