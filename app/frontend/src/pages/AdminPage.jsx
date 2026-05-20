import { useState, useCallback, useEffect } from 'react'

// ─── Admin API helpers ──────────────────────────────────────────────────────────

async function fetchJson(url) {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!resp.ok) return null
    return await resp.json()
  } catch { return null }
}

// ─── Sidebar Navigation ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'services', icon: '🖥️', label: 'Services' },
  { id: 'users', icon: '👥', label: 'Users' },
  { id: 'flashcards', icon: '🃏', label: 'Flashcards' },
  { id: 'conversations', icon: '💬', label: 'Conversations' },
  { id: 'llm', icon: '🤖', label: 'LLM Config' },
]

function Sidebar({ active, onNavigate }) {
  return (
    <nav style={{
      width: '220px', minHeight: '100vh', background: '#1a1a2e', padding: '20px 0',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '0 20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: 0 }}>⚙️ Admin</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px' }}>Management Panel</p>
      </div>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 20px', border: 'none', width: '100%', textAlign: 'left',
            background: active === item.id ? 'rgba(106,130,251,0.2)' : 'transparent',
            color: active === item.id ? '#8fa4ff' : 'rgba(255,255,255,0.6)',
            fontSize: '14px', fontWeight: active === item.id ? 700 : 500,
            cursor: 'pointer', transition: 'all 0.15s',
            borderLeft: active === item.id ? '3px solid #6a82fb' : '3px solid transparent',
          }}
        >
          <span style={{ fontSize: '16px' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <a href="/dashboard" style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'none' }}>
        ← Back to App
      </a>
    </nav>
  )
}

// ─── Overview Panel ─────────────────────────────────────────────────────────────

function OverviewPanel() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJson('/api/admin/stats').then((data) => { setStats(data); setLoading(false) })
  }, [])

  if (loading) return <PanelLoading />

  const cards = [
    { label: 'Total Users', value: stats?.users?.total ?? 0, color: '#6a82fb' },
    { label: 'Flashcards', value: stats?.flashcards?.total ?? 0, color: '#27ae60' },
    { label: 'Chat Inline', value: stats?.flashcards?.byChatInline ?? 0, color: '#2ecc71' },
    { label: 'Conversations', value: stats?.conversations?.total ?? 0, color: '#f39c12' },
  ]

  return (
    <div>
      <PanelHeader title="Overview" subtitle="System statistics at a glance" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Services Panel ─────────────────────────────────────────────────────────────

const SERVICES = [
  { id: 'gateway', name: 'Gateway', port: 5000, url: '/health' },
  { id: 'auth', name: 'Auth Service', port: 5001, url: '/api/auth/health' },
  { id: 'ai-chat', name: 'AI Chat Service', port: 5002, url: '/api/chat/health' },
  { id: 'flashcard', name: 'Flashcard Service', port: 3003, url: '/api/flashcards/health' },
  { id: 'content', name: 'Content Service', port: 5003, url: '/api/content/health' },
  { id: 'quiz', name: 'Quiz Service', port: 5004, url: '/api/quizzes/health' },
]

function ServicesPanel() {
  const [services, setServices] = useState(SERVICES.map(s => ({ ...s, status: 'checking', ms: null })))
  const [checking, setChecking] = useState(false)

  const check = useCallback(async () => {
    setChecking(true)
    const results = await Promise.all(SERVICES.map(async (s) => {
      const start = Date.now()
      try {
        const r = await fetch(s.url, { signal: AbortSignal.timeout(5000) })
        return { ...s, status: r.ok ? 'online' : 'error', ms: Date.now() - start }
      } catch {
        return { ...s, status: 'offline', ms: Date.now() - start }
      }
    }))
    setServices(results)
    setChecking(false)
  }, [])

  useEffect(() => { check() }, [check])

  const statusBadge = (status) => {
    const map = { online: { bg: '#d4edda', color: '#155724' }, offline: { bg: '#f8d7da', color: '#721c24' }, error: { bg: '#fff3cd', color: '#856404' }, checking: { bg: '#e2e3e5', color: '#383d41' } }
    const s = map[status] || map.checking
    return <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>{status.toUpperCase()}</span>
  }

  return (
    <div>
      <PanelHeader title="Services" subtitle="Health check for all microservices" action={<button onClick={check} disabled={checking} style={actionBtnStyle}>{checking ? '⟳ Checking...' : '⟳ Refresh'}</button>} />
      <Table
        columns={['Service', 'Port', 'Status', 'Response Time']}
        rows={services.map(s => [
          <strong>{s.name}</strong>,
          s.port,
          statusBadge(s.status),
          s.ms != null ? `${s.ms}ms` : '—',
        ])}
      />
    </div>
  )
}

// ─── Users Panel ────────────────────────────────────────────────────────────────

function UsersPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ email: '', password: '', role: 'user' })

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchJson('/api/admin/users')
    setUsers(data?.users || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.email || !form.password) return alert('Email and password required')
    const resp = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (resp.ok) { setShowForm(false); setForm({ email: '', password: '', role: 'user' }); load() }
    else { const d = await resp.json(); alert(d.error || 'Failed') }
  }

  const handleUpdate = async () => {
    const body = {}
    if (form.role) body.role = form.role
    if (form.password) body.password = form.password
    const resp = await fetch(`/api/admin/users/${editUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (resp.ok) { setEditUser(null); setForm({ email: '', password: '', role: 'user' }); load() }
    else { const d = await resp.json(); alert(d.error || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    const resp = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (resp.ok) load()
  }

  if (loading) return <PanelLoading />

  return (
    <div>
      <PanelHeader title="Users" subtitle={`${users.length} registered users`} action={<button onClick={() => { setShowForm(true); setEditUser(null); setForm({ email: '', password: '', role: 'user' }) }} style={actionBtnStyle}>+ Create User</button>} />

      {/* Create / Edit Form */}
      {(showForm || editUser) && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>{editUser ? `Edit: ${editUser.email}` : 'Create New User'}</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {!editUser && <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />}
            <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button onClick={editUser ? handleUpdate : handleCreate} style={actionBtnStyle}>{editUser ? 'Update' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); setEditUser(null) }} style={{ ...actionBtnStyle, background: '#e0e0e0', color: '#333' }}>Cancel</button>
          </div>
        </div>
      )}

      {users.length === 0 ? <EmptyState text="No users found" /> : (
        <Table
          columns={['Email', 'Role', 'User ID', 'Actions']}
          rows={users.map(u => [
            u.email,
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, background: u.role === 'admin' ? '#fff3cd' : '#d4edda', color: u.role === 'admin' ? '#856404' : '#155724' }}>{u.role || 'user'}</span>,
            <code style={{ fontSize: '11px', color: '#888' }}>{u.id?.substring(0, 24)}</code>,
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => { setEditUser(u); setForm({ email: u.email, password: '', role: u.role || 'user' }); setShowForm(false) }} style={editBtnStyle}>Edit</button>
              <button onClick={() => handleDelete(u.id)} style={deleteBtnStyle}>Delete</button>
            </div>,
          ])}
        />
      )}
    </div>
  )
}

// ─── Flashcards Panel (CRUD) ────────────────────────────────────────────────────

function FlashcardsPanel() {
  const [flashcards, setFlashcards] = useState([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [form, setForm] = useState({ word: '', ipa: '', meaning: '', example: '', source: 'admin' })

  const load = useCallback(async (source) => {
    setLoading(true)
    const url = source ? `/api/admin/flashcards?limit=50&source=${source}` : '/api/admin/flashcards?limit=50'
    const data = await fetchJson(url)
    setFlashcards(data?.flashcards || [])
    setTotal(data?.total || 0)
    setLoading(false)
  }, [])

  useEffect(() => { load(filter) }, [load, filter])

  const handleCreate = async () => {
    if (!form.word || !form.meaning) return alert('Word and meaning required')
    const resp = await fetch('/api/admin/flashcards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (resp.ok) { setShowForm(false); setForm({ word: '', ipa: '', meaning: '', example: '', source: 'admin' }); load(filter) }
    else { const d = await resp.json(); alert(d.error || 'Failed') }
  }

  const handleUpdate = async () => {
    const resp = await fetch(`/api/admin/flashcards/${editCard._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: form.word, ipa: form.ipa, meaning: form.meaning, example: form.example }) })
    if (resp.ok) { setEditCard(null); setForm({ word: '', ipa: '', meaning: '', example: '', source: 'admin' }); load(filter) }
    else { const d = await resp.json(); alert(d.error || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this flashcard?')) return
    const resp = await fetch(`/api/admin/flashcards/${id}`, { method: 'DELETE' })
    if (resp.ok) { setFlashcards(prev => prev.filter(fc => fc._id !== id)); setTotal(t => t - 1) }
  }

  return (
    <div>
      <PanelHeader title="Flashcards" subtitle={`${total} total cards`} action={<button onClick={() => { setShowForm(true); setEditCard(null); setForm({ word: '', ipa: '', meaning: '', example: '', source: 'admin' }) }} style={actionBtnStyle}>+ Create Card</button>} />

      {/* Create / Edit Form */}
      {(showForm || editCard) && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>{editCard ? `Edit: ${editCard.word}` : 'Create New Flashcard'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input placeholder="Word *" value={form.word} onChange={e => setForm({ ...form, word: e.target.value })} style={inputStyle} />
            <input placeholder="IPA (e.g. /wɜːrd/)" value={form.ipa} onChange={e => setForm({ ...form, ipa: e.target.value })} style={inputStyle} />
            <input placeholder="Meaning (Vietnamese) *" value={form.meaning} onChange={e => setForm({ ...form, meaning: e.target.value })} style={inputStyle} />
            <input placeholder="Example sentence" value={form.example} onChange={e => setForm({ ...form, example: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={editCard ? handleUpdate : handleCreate} style={actionBtnStyle}>{editCard ? 'Update' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); setEditCard(null) }} style={{ ...actionBtnStyle, background: '#e0e0e0', color: '#333' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[null, 'chat-inline', 'ai', 'seed', 'admin'].map((src) => (
          <button key={src || 'all'} onClick={() => setFilter(src)} style={{
            border: 'none', borderRadius: '999px', padding: '6px 14px', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', background: filter === src ? '#6a82fb' : '#f0f0f0', color: filter === src ? '#fff' : '#555',
          }}>
            {src || 'All'}
          </button>
        ))}
      </div>

      {loading ? <PanelLoading /> : flashcards.length === 0 ? <EmptyState text="No flashcards found" /> : (
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={['Word', 'IPA', 'Meaning', 'Example', 'Source', 'Actions']}
            rows={flashcards.map(fc => [
              <strong>{fc.word}</strong>,
              <em style={{ fontSize: '12px', color: '#6a82fb' }}>{fc.ipa}</em>,
              fc.meaning,
              <span style={{ fontSize: '12px', color: '#666', maxWidth: '180px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fc.example}</span>,
              <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, background: fc.source === 'chat-inline' ? '#d4edda' : '#e2e3e5', color: fc.source === 'chat-inline' ? '#155724' : '#383d41' }}>{fc.source}</span>,
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => { setEditCard(fc); setForm({ word: fc.word, ipa: fc.ipa || '', meaning: fc.meaning, example: fc.example || '', source: fc.source }); setShowForm(false) }} style={editBtnStyle}>Edit</button>
                <button onClick={() => handleDelete(fc._id)} style={deleteBtnStyle}>Delete</button>
              </div>,
            ])}
          />
        </div>
      )}
    </div>
  )
}

// ─── Conversations Panel ────────────────────────────────────────────────────────

function ConversationsPanel() {
  const [conversations, setConversations] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchJson('/api/admin/conversations?limit=20')
    setConversations(data?.conversations || [])
    setTotal(data?.total || 0)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this conversation?')) return
    const resp = await fetch(`/api/admin/conversations/${id}`, { method: 'DELETE' })
    if (resp.ok) { setConversations(prev => prev.filter(c => c.id !== id)); setTotal(t => t - 1) }
  }

  if (loading) return <PanelLoading />

  return (
    <div>
      <PanelHeader title="Conversations" subtitle={`${total} total conversations`} action={<button onClick={load} style={actionBtnStyle}>⟳ Refresh</button>} />
      {conversations.length === 0 ? <EmptyState text="No conversations found" /> : (
        <Table
          columns={['Conversation ID', 'User', 'Messages', 'Last Message', 'Last Activity', 'Actions']}
          rows={conversations.map(c => [
            <code style={{ fontSize: '11px' }}>{c.id?.substring(0, 20)}</code>,
            <code style={{ fontSize: '11px', color: '#888' }}>{c.userId?.substring(0, 14) || 'guest'}</code>,
            <strong>{c.messageCount}</strong>,
            <span style={{ fontSize: '12px', color: '#666', maxWidth: '150px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage || '—'}</span>,
            c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '—',
            <button onClick={() => handleDelete(c.id)} style={deleteBtnStyle}>Delete</button>,
          ])}
        />
      )}
    </div>
  )
}

// ─── LLM Config Panel ───────────────────────────────────────────────────────────

function LLMPanel() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchJson('/api/admin/llm-config').then((data) => { setConfig(data); setLoading(false) })
  }, [])

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const start = Date.now()
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'hi', level: 'Intermediate' }),
        signal: AbortSignal.timeout(30000),
      })
      const data = await resp.json()
      const elapsed = Date.now() - start
      if (data.reply) {
        setTestResult({ success: true, message: `✓ Response in ${elapsed}ms: "${data.reply.substring(0, 60)}..."` })
      } else {
        setTestResult({ success: false, message: `✗ No reply received (${elapsed}ms)` })
      }
    } catch (err) {
      setTestResult({ success: false, message: `✗ ${err.message}` })
    }
    setTesting(false)
  }

  if (loading) return <PanelLoading />

  const rows = config ? [
    ['Provider', config.primary?.provider || '—'],
    ['Base URL', config.primary?.baseUrl || '—'],
    ['Chat Model', config.primary?.model || '—'],
    ['Flashcard Model', config.flashcard?.model || '—'],
    ['API Key', config.primary?.hasKey ? '✓ Configured' : '✗ Missing'],
    ['Fallback Provider', config.fallback?.provider || '—'],
    ['Fallback Model', config.fallback?.model || '—'],
    ['Fallback Key', config.fallback?.hasKey ? '✓ Configured' : '✗ Missing'],
  ] : []

  return (
    <div>
      <PanelHeader title="LLM Configuration" subtitle="AI model settings (read-only)" action={<button onClick={testConnection} disabled={testing} style={actionBtnStyle}>{testing ? '⟳ Testing...' : '🧪 Test Connection'}</button>} />
      {testResult && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '14px', background: testResult.success ? '#d4edda' : '#f8d7da', color: testResult.success ? '#155724' : '#721c24', fontSize: '13px' }}>
          {testResult.message}
        </div>
      )}
      <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {rows.map(([label, value], i) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < rows.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
            <span style={{ color: '#888', fontSize: '13px' }}>{label}</span>
            <span style={{ color: '#2d2d3a', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Shared Components ──────────────────────────────────────────────────────────

function PanelHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#2d2d3a', margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function PanelLoading() {
  return <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}><div className="spinner" style={{ margin: '0 auto 12px', width: '24px', height: '24px', border: '3px solid #eee', borderTopColor: '#6a82fb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Loading...</div>
}

function EmptyState({ text }) {
  return <div style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '14px' }}>📭 {text}</div>
}

function Table({ columns, rows }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #eee', color: '#888', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', background: '#fafafa' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f8f8f8' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px 12px', verticalAlign: 'middle' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const actionBtnStyle = { border: 'none', background: '#6a82fb', color: '#fff', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
const editBtnStyle = { border: 'none', background: '#e8f0fe', color: '#1a73e8', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }
const deleteBtnStyle = { border: 'none', background: '#f8d7da', color: '#721c24', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }
const inputStyle = { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '100%' }

// ─── Main Admin Page ────────────────────────────────────────────────────────────

function AdminPage() {
  const [activePanel, setActivePanel] = useState('overview')

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview': return <OverviewPanel />
      case 'services': return <ServicesPanel />
      case 'users': return <UsersPanel />
      case 'flashcards': return <FlashcardsPanel />
      case 'conversations': return <ConversationsPanel />
      case 'llm': return <LLMPanel />
      default: return <OverviewPanel />
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <Sidebar active={activePanel} onNavigate={setActivePanel} />
      <main style={{ flex: 1, padding: '30px 40px', overflowY: 'auto' }}>
        {renderPanel()}
      </main>
    </div>
  )
}

export default AdminPage
