import Markdown from 'react-markdown'
import Badge from './Badge'

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
      </div>
    </div>
  )
}

export default ChatMessage
