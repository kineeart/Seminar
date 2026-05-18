import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="app-page">
      <div className="app-shell fade-in center-header">
        <span className="chip">404</span>
        <h1>Page not found</h1>
        <p>This route does not exist. Return to the main flow.</p>
        <Link className="btn btn-primary" to="/landing">Go to Landing Page</Link>
      </div>
    </main>
  )
}

export default NotFoundPage

