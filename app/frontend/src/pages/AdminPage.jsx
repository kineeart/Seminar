import MainLayout from '../components/layout/MainLayout'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { adminMetrics, reports } from '../data/mockAdmin'

function AdminPage() {
  return (
    <MainLayout>
      <header className="page-header row-between">
        <div>
          <span className="chip">Admin</span>
          <h1>Dashboard</h1>
        </div>
        <Badge>Internal</Badge>
      </header>

      <section className="stats-grid">
        {adminMetrics.map((metric) => (
          <Card key={metric.label} className="stat-card">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </Card>
        ))}
      </section>

      <section className="section-stack">
        <h2>Reports</h2>
        {reports.map((report) => (
          <Card key={report.title} className="deck-row">
            <div>
              <strong>{report.title}</strong>
              <small>{report.detail}</small>
            </div>
            <Badge>{report.status}</Badge>
          </Card>
        ))}
      </section>
    </MainLayout>
  )
}

export default AdminPage

