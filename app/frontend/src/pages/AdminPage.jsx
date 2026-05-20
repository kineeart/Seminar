import useAdmin from '../hooks/useAdmin'

const STATUS_CONFIG = {
  online: { color: '#27ae60', bg: 'rgba(39, 174, 96, 0.1)', icon: '✓', label: 'Online' },
  offline: { color: '#e74c3c', bg: 'rgba(231, 76, 60, 0.1)', icon: '✗', label: 'Offline' },
  error: { color: '#f39c12', bg: 'rgba(243, 156, 18, 0.1)', icon: '⚠', label: 'Error' },
  checking: { color: '#95a5a6', bg: 'rgba(149, 165, 166, 0.1)', icon: '…', label: 'Checking' },
}

function ServiceCard({ service }) {
  const config = STATUS_CONFIG[service.status] || STATUS_CONFIG.checking

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '16px 20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      border: `1px solid ${config.bg}`,
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: config.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 700,
        color: config.color,
        flexShrink: 0,
      }}>
        {config.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#2d2d3a' }}>{service.name}</div>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
          Port {service.port}
          {service.responseTime != null && ` · ${service.responseTime}ms`}
        </div>
        {service.error && service.status !== 'online' && (
          <div style={{ fontSize: '11px', color: config.color, marginTop: '3px' }}>
            {service.error}
          </div>
        )}
      </div>
      <div style={{
        padding: '4px 10px',
        borderRadius: '999px',
        background: config.bg,
        color: config.color,
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {config.label}
      </div>
    </div>
  )
}

function AdminPage() {
  const { services, loading, lastChecked, onlineCount, totalCount, refresh } = useAdmin()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(106, 130, 251, 0.12)',
                color: '#5664c7',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '6px',
              }}>Admin Panel</span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#2d2d3a', margin: 0 }}>
                System Status 🖥️
              </h1>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              style={{
                border: 'none',
                background: '#6a82fb',
                color: '#fff',
                borderRadius: '999px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '⟳ Checking...' : '⟳ Refresh'}
            </button>
          </div>
          {lastChecked && (
            <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </header>

        {/* Summary Card */}
        <div style={{
          background: onlineCount === totalCount
            ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
            : onlineCount > 0
              ? 'linear-gradient(135deg, #f39c12, #e67e22)'
              : 'linear-gradient(135deg, #e74c3c, #c0392b)',
          borderRadius: '18px',
          padding: '20px 24px',
          color: '#fff',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: 600 }}>Services Status</div>
          <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '4px' }}>
            {onlineCount} / {totalCount} Online
          </div>
          <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>
            {onlineCount === totalCount
              ? '✓ All services are running normally'
              : `⚠ ${totalCount - onlineCount} service(s) need attention`}
          </div>
        </div>

        {/* Service List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/dashboard" style={{ color: '#6a82fb', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
