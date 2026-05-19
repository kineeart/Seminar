import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import ChatMessage from '../components/ui/ChatMessage'
import ProgressBar from '../components/ui/ProgressBar'
import useRoleplay from '../hooks/useRoleplay'

function RoleplayPage() {
  const navigate = useNavigate()
  const {
    scenarios, scenario, messages, input, setInput,
    isTyping, goalProgress, isComplete,
    startScenario, resetScenario, send,
  } = useRoleplay()

  // Scenario selection screen
  if (!scenario) {
    return (
      <MainLayout navActive="chat" className="chat-shell">
        <header className="page-header row-between">
          <h1>AI Tutor</h1>
          <div className="mode-toggle">
            <button type="button" aria-pressed="false" onClick={() => navigate('/chat')}>Knowledge</button>
            <button className="active" type="button" aria-pressed="true">Roleplay</button>
          </div>
        </header>

        <div style={{ marginBottom: '8px' }}>
          <span className="chip">🎭 Choose a Scenario</span>
          <p className="muted" style={{ marginTop: '6px' }}>Practice real-life English conversations</p>
        </div>

        <div className="col">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className="card-base card-interactive"
              onClick={() => startScenario(s.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && startScenario(s.id)}
              role="button"
              tabIndex={0}
            >
              <div className="between">
                <div>
                  <span style={{ fontSize: '24px' }}>{s.icon}</span>
                  <h3 style={{ marginTop: '4px' }}>{s.title}</h3>
                  <p className="muted" style={{ fontSize: '12px' }}>{s.subtitle}</p>
                </div>
                <button className="btn btn-inline" onClick={(e) => { e.stopPropagation(); startScenario(s.id) }}>Start</button>
              </div>
              <p className="muted" style={{ marginTop: '8px', fontSize: '12px' }}>🎯 {s.goal}</p>
            </div>
          ))}
        </div>
      </MainLayout>
    )
  }

  // Active roleplay screen
  const currentScenario = scenarios.find((s) => s.id === scenario)
  const progress = goalProgress
    ? Math.round((goalProgress.completedSteps.length / goalProgress.totalSteps) * 100)
    : 0

  return (
    <MainLayout navActive="chat" className="chat-shell">
      <header className="page-header row-between">
        <div>
          <span className="chip">🎭 {currentScenario?.title}</span>
          <h1>{currentScenario?.subtitle}</h1>
        </div>
        <button className="btn ghost btn-inline" onClick={resetScenario}>✕</button>
      </header>

      {/* Goal progress */}
      <div className="progress-bar-label">
        <span className="muted" style={{ fontSize: '12px' }}>🎯 Goal: {currentScenario?.goal}</span>
        <ProgressBar value={progress} />
      </div>

      {/* Messages */}
      <div className="message-list">
        {messages.map((m) => {
          if (m.role === 'system') {
            return (
              <div key={m.id} className="card-base" style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', color: '#fff', textAlign: 'center' }}>
                <ChatMessage message={{ ...m, role: 'ai' }} />
              </div>
            )
          }
          return <ChatMessage key={m.id} message={m} />
        })}
        {isTyping ? <div className="message ai typing"><span>.</span><span>.</span><span>.</span></div> : null}
      </div>

      {/* Input */}
      {isComplete ? (
        <div className="action-row">
          <Button onClick={resetScenario}>Try Another Scenario</Button>
        </div>
      ) : (
        <form className="input-bar" onSubmit={(e) => { e.preventDefault(); send() }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your reply..." />
          <Button type="submit" size="sm">Send</Button>
        </form>
      )}
    </MainLayout>
  )
}

export default RoleplayPage
