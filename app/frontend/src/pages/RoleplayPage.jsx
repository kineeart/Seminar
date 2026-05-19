import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ChatMessage from '../components/ui/ChatMessage'
import ProgressBar from '../components/ui/ProgressBar'
import useRoleplay from '../hooks/useRoleplay'

function RoleplayPage() {
  const navigate = useNavigate()
  const { messages, input, setInput, step, isTyping, send, handleQuick, quickReplies, scenario, scenarios, changeScenario, animating } = useRoleplay()
  const messageListRef = useRef(null)

  useEffect(() => {
    const node = messageListRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, isTyping, scenario.id])

  return (
    <MainLayout navActive="chat" className="chat-shell roleplay-shell">
      <header className={`page-header chat-header ${animating ? 'scenario-anim' : ''}`}>
        <div className="row-between">
          <h1>AI Tutor</h1>
          <div className="mode-toggle">
            <button type="button" onClick={() => navigate('/chat')}>Knowledge</button>
            <button className="active" type="button" aria-pressed>Roleplay</button>
          </div>
        </div>

        <div className="row-between">
          <div>
            <span className="chip">Roleplay mode</span>
            <h2>{scenario.title}</h2>
            <p>{scenario.subtitle}</p>
          </div>
          <Badge>{scenario.assistant}</Badge>
        </div>
      </header>

      <div className="scenario-strip" role="tablist" aria-label="Roleplay scenarios">
        {scenarios.map((item) => (
          <button
            key={item.id}
            type="button"
            className={scenario.id === item.id ? 'scenario-chip active' : 'scenario-chip'}
            onClick={() => changeScenario(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="roleplay-menu-card">
        <strong>Scenario menu</strong>
        <p>Choose a real-life context. The AI will stay in that role and keep the conversation going.</p>
      </div>

      <div className="progress-bar-label">
        <span>Conversation {step}</span>
        <ProgressBar value={Math.min(step, 20)} max={20} />
      </div>

      <div className={`message-list ${animating ? 'scenario-pulse' : ''}`} ref={messageListRef}>
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </div>

      <div className="chat-compose">
        <div className="quick-actions">
          {quickReplies?.map((r) => <Button key={r} size="sm" variant="ghost" onClick={() => handleQuick(r)}>{r}</Button>)}
        </div>

        {isTyping ? <div className="typing typing-fixed"><span>.</span><span>.</span><span>.</span></div> : null}

        <form className="input-bar" onSubmit={(e) => { e.preventDefault(); send() }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your reply..." />
          <Button type="submit" size="sm">Send</Button>
        </form>
      </div>
    </MainLayout>
  )
}

export default RoleplayPage
