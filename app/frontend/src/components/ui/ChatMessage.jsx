import Markdown from 'react-markdown'
import Badge from './Badge'
import FlashcardCard from './FlashcardCard'

function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={isUser ? 'message user' : 'message ai'}>
      {message.label ? <Badge>{message.label}</Badge> : message.role === 'ai' ? <Badge>AI</Badge> : null}
      <div className="message-content">
        {isUser ? (
          <p>{message.text}</p>
        ) : (
          <Markdown
            components={{
              p: ({ children }) => <p>{children}</p>,
              strong: ({ children }) => <strong>{children}</strong>,
              em: ({ children }) => <em>{children}</em>,
              ul: ({ children }) => <ul className="msg-list">{children}</ul>,
              ol: ({ children }) => <ol className="msg-list">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              code: ({ children }) => <code className="msg-code">{children}</code>,
            }}
          >
            {message.text}
          </Markdown>
        )}
        {!isUser && Array.isArray(message.flashcards) && message.flashcards.length > 0 && (
          <div className="flashcard-inline-list">
            {message.flashcards.map((fc, idx) => (
              <FlashcardCard key={fc.id || fc.word || idx} flashcard={fc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
