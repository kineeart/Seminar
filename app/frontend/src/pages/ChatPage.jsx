import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import ChatMessage from '../components/ui/ChatMessage'
import useChat from '../hooks/useChat'

function ChatPage() {
  const navigate = useNavigate()
  const { messages, input, setInput, isTyping, mode, setMode, send, handleQuick } = useChat()
  const messageListRef = useRef(null)

  useEffect(() => {
    const node = messageListRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, isTyping])

  return (
    <MainLayout navActive="chat" className="chat-shell">
      <header className="page-header row-between chat-header">
        <h1>AI Tutor</h1>
        <div className="mode-toggle">
          <button className={mode === 'knowledge' ? 'active' : ''} onClick={() => setMode('knowledge')} type="button" aria-pressed={mode === 'knowledge'}>Knowledge</button>
          <button className={mode === 'roleplay' ? 'active' : ''} onClick={() => navigate('/roleplay')} type="button" aria-pressed={mode === 'roleplay'}>Roleplay</button>
        </div>
      </header>

      <div className="message-list" ref={messageListRef}>
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </div>

      <div className="chat-compose">
        <div className="quick-actions">
          <Button size="sm" variant="ghost" onClick={() => handleQuick('Explain more about phrasal verbs.')}>Explain More</Button>
          <Button size="sm" variant="ghost" onClick={() => handleQuick('Create flashcards for me.')}>Create Flashcards</Button>
          <Button size="sm" variant="ghost" onClick={() => handleQuick('Give me a quick quiz.')}>Create Quiz</Button>
        </div>

        {isTyping ? <div className="typing typing-fixed"><span>.</span><span>.</span><span>.</span></div> : null}

        <form className="input-bar" onSubmit={(e) => { e.preventDefault(); send() }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." />
          <Button type="submit" size="sm">Send</Button>
        </form>
      </div>
    </MainLayout>
  )
}

export default ChatPage
