import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useChatDemo } from '../hooks/useChatDemo'

function ChatPage() {
  const demo = useChatDemo()

  return (
    <MainLayout navActive="chat" className="chat-shell">
      <header className="page-header row-between">
        <h1>AI Tutor</h1>
        <div className="mode-toggle">
          <button className={demo.mode === 'knowledge' ? 'active' : ''} onClick={() => demo.setMode('knowledge')} type="button">Knowledge</button>
          <button className={demo.mode === 'roleplay' ? 'active' : ''} onClick={() => demo.setMode('roleplay')} type="button">Roleplay</button>
        </div>
      </header>

      <div className="message-list">
        {demo.messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'message user' : 'message ai'}>
            {m.role === 'ai' ? <Badge>AI</Badge> : null}
            <p>{m.text}</p>
          </div>
        ))}
        {demo.isTyping ? <div className="message ai typing"><span>.</span><span>.</span><span>.</span></div> : null}
      </div>

      <div className="quick-actions">
        <Button size="sm" variant="ghost" onClick={() => demo.handleQuick('Explain more about phrasal verbs.')}>Explain More</Button>
        <Button size="sm" variant="ghost" onClick={() => demo.handleQuick('Create flashcards for me.')}>Create Flashcards</Button>
        <Button size="sm" variant="ghost" onClick={() => demo.handleQuick('Give me a quick quiz.')}>Create Quiz</Button>
      </div>

      <form className="input-bar" onSubmit={(e) => { e.preventDefault(); demo.send() }}>
        <input value={demo.input} onChange={(e) => demo.setInput(e.target.value)} placeholder="Ask anything..." />
        <Button type="submit" size="sm">Send</Button>
      </form>
    </MainLayout>
  )
}

export default ChatPage

