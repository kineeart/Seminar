import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import ChatMessage from '../components/ui/ChatMessage'
import useChat from '../hooks/useChat'

function ChatPage() {
  const navigate = useNavigate()
  const { messages, input, setInput, isTyping, send, handleQuick, startNewSession } = useChat()

  return (
    <MainLayout navActive="chat" className="chat-shell">
      <header className="page-header row-between">
        <div>
          <p className="muted">AI Tutor</p>
          <h1>Knowledge</h1>
        </div>
        <div className="mode-toggle">
          <button className="active" type="button">Knowledge</button>
          <button type="button" onClick={() => navigate('/roleplay')}>Roleplay</button>
        </div>
      </header>

      <div className="message-list">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isTyping ? <div className="message ai typing"><span>.</span><span>.</span><span>.</span></div> : null}
      </div>

      <div className="quick-actions">
        <Button size="sm" variant="ghost" onClick={() => handleQuick('Explain more about phrasal verbs.')}>Explain More</Button>
        <Button size="sm" variant="ghost" onClick={() => handleQuick('Create flashcards for me.')}>Create Flashcards</Button>
        <Button size="sm" variant="ghost" onClick={() => handleQuick('Give me a quick quiz.')}>Create Quiz</Button>
      </div>

      <form className="input-bar" onSubmit={(e) => { e.preventDefault(); send() }}>
        <button type="button" className="new-session-btn" onClick={startNewSession} title="New session">+</button>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." />
        <Button type="submit" size="sm">Send</Button>
      </form>
    </MainLayout>
  )
}

export default ChatPage
