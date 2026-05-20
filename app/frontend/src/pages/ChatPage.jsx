import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import MainLayout from '../components/layout/MainLayout'
import Button from '../components/ui/Button'
import ChatMessage from '../components/ui/ChatMessage'
import useChat from '../hooks/useChat'

function ChatPage() {
  const navigate = useNavigate()
  const {
    messages,
    input,
    setInput,
    isTyping,
    send,
    handleQuick,
    startNewSession,
    pendingFlashcards,
    conversationList,
    historyOpen,
    setHistoryOpen,
    historyLoading,
    openConversation,
  } = useChat()
  const [topicInput, setTopicInput] = useState('')

  const hasPendingTopic = pendingFlashcards && pendingFlashcards.length > 0

  const handleSubmitTopic = (e) => {
    e.preventDefault()
    if (topicInput.trim()) {
      send(topicInput.trim())
      setTopicInput('')
    }
  }

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
          <button type="button" onClick={() => setHistoryOpen((v) => !v)}>History</button>
        </div>
      </header>

      {historyOpen ? (
        <div className="card-base" style={{ marginBottom: '12px' }}>
          <div className="between" style={{ marginBottom: '8px' }}>
            <strong>Chat History</strong>
            <button type="button" className="new-session-btn" onClick={startNewSession}>+</button>
          </div>
          {historyLoading ? (
            <p className="muted">Loading history...</p>
          ) : conversationList.length === 0 ? (
            <p className="muted">No history yet.</p>
          ) : (
            <div className="col" style={{ gap: '8px' }}>
              {conversationList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="card-base deck-pick"
                  onClick={() => openConversation(item.id)}
                >
                  <strong>{item.last_message || 'Untitled chat'}</strong>
                  <p className="muted" style={{ margin: '4px 0 0', fontSize: '12px' }}>
                    {item.message_count || 0} messages
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

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

      {hasPendingTopic ? (
        <form className="input-bar topic-form" onSubmit={handleSubmitTopic}>
          <button type="button" className="new-session-btn" onClick={startNewSession} title="New session">+</button>
          <input
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Nhập tên topic cho flashcard (ví dụ: Office TOEIC)..."
            autoFocus
          />
          <Button type="submit" size="sm">Lưu</Button>
        </form>
      ) : (
        <form className="input-bar" onSubmit={(e) => { e.preventDefault(); send() }}>
          <button type="button" className="new-session-btn" onClick={startNewSession} title="New session">+</button>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." />
          <Button type="submit" size="sm">Send</Button>
        </form>
      )}
    </MainLayout>
  )
}

export default ChatPage
