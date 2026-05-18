import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import { useRoleplayDemo } from '../hooks/useChatDemo'

function RoleplayPage() {
  const demo = useRoleplayDemo()

  return (
    <MainLayout navActive="chat" className="chat-shell">
      <header className="page-header row-between">
        <div>
          <span className="chip">Scenario</span>
          <h1>Ordering Coffee</h1>
        </div>
        <Badge>Berger Café · Beginner</Badge>
      </header>

      <div className="progress-bar-label">
        <span>Conversation {demo.step} / 8</span>
        <ProgressBar value={demo.step} max={8} />
      </div>

      <div className="message-list">
        {demo.messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'message user' : 'message ai'}>
            {m.label ? <Badge>{m.label}</Badge> : null}
            <p>{m.text}</p>
          </div>
        ))}
        {demo.isTyping ? <div className="message ai typing"><span>.</span><span>.</span><span>.</span></div> : null}
      </div>

      <div className="quick-actions">
        {demo.quickReplies?.map((r) => <Button key={r} size="sm" variant="ghost" onClick={() => demo.handleQuick(r)}>{r}</Button>)}
      </div>

      <form className="input-bar" onSubmit={(e) => { e.preventDefault(); demo.send() }}>
        <input value={demo.input} onChange={(e) => demo.setInput(e.target.value)} placeholder="Type your reply..." />
        <Button type="submit" size="sm">Send</Button>
      </form>
    </MainLayout>
  )
}

export default RoleplayPage