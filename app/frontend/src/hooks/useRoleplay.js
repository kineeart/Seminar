import { useCallback, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import chatService from '../services/chat.service'

const quickReplies = ['Can I get it iced?', 'What sizes do you have?', 'That is all, thank you.']

export default function useRoleplay() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', label: 'BARISTA', text: 'Good morning! What can I get for you today?' },
  ])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(1)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState(null)

  const send = useCallback(
    async (overrideText) => {
      const text = typeof overrideText === 'string' ? overrideText : input
      if (!text.trim()) return

      const userMsg = { id: Date.now(), role: 'user', label: 'YOU', text }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)
      setStep((s) => Math.min(8, s + 1))

      try {
        const data = await chatService.sendMessage(text, conversationId, 'roleplay', user)
        if (data.conversationId) {
          setConversationId(data.conversationId)
        }
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            label: 'BARISTA',
            text: data.reply || data.message || 'Sure! That comes to $5.50. Cash or card?',
          },
        ])
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'ai', label: 'BARISTA', text: `Error: ${err.message}` },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    [input, conversationId, user],
  )

  const handleQuick = useCallback(
    (text) => {
      setInput(text)
      send(text)
    },
    [send],
  )

  return { messages, input, setInput, step, isTyping, send, handleQuick, quickReplies }
}
