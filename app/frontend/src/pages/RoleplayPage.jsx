import MainLayout from '../components/layout/MainLayout'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ChatMessage from '../components/ui/ChatMessage'
import ProgressBar from '../components/ui/ProgressBar'
import useRoleplay from '../hooks/useRoleplay'

function RoleplayPage() {
  const { messages, input, setInput, step, isTyping, send, handleQuick, quickReplies } = useRoleplay()

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
        <span>Conversation {step} / 8</span>
        <ProgressBar value={step} max={8} />
      </div>

      <div className="message-list">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isTyping ? <div className="message ai typing"><span>.</span><span>.</span><span>.</span></div> : null}
      </div>

      <div className="quick-actions">
        {quickReplies?.map((r) => <Button key={r} size="sm" variant="ghost" onClick={() => handleQuick(r)}>{r}</Button>)}
      </div>

      <form className="input-bar" onSubmit={(e) => { e.preventDefault(); send() }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your reply..." />
        <Button type="submit" size="sm">Send</Button>
      </form>
    </MainLayout>
  )
}

export default RoleplayPage
