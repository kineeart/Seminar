import MainLayout from '../components/layout/MainLayout'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import useAdmin from '../hooks/useAdmin'

function AdminPage() {
  const { metrics, reports, loading } = useAdmin()

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner text="Loading admin data..." />
      </MainLayout>
    )
  }

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
        {metrics.map((metric) => (
          <Card key={metric.label} className="stat-card">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </Card>
        ))}
      </section>

      <section className="section-stack">
        <h2>Reports</h2>
        {reports.length === 0 ? (
          <Card className="deck-row"><p>No reports found.</p></Card>
        ) : (
          reports.map((report) => (
            <Card key={report.title || report._id} className="deck-row">
              <div>
                <strong>{report.title}</strong>
                <small>{report.detail}</small>
              </div>
              <Badge>{report.status}</Badge>
            </Card>
          ))
        )}
      </section>
    </MainLayout>
  )
}

export default AdminPage
