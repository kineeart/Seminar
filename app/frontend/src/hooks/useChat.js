import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import chatService from '../services/chat.service'

export default function useChat() {
  const { user } = useAuth()

  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'Hi! Ask me anything about English, TOEIC, IELTS, or daily communication.' },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState('knowledge')
  const [conversationId, setConversationId] = useState(null)
  const [pendingFlashcards, setPendingFlashcards] = useState([])
  const [conversationList, setConversationList] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Khi bấm vào history item → load conversation cũ từ server
  const loadConversationList = useCallback(async () => {
    const userId = user?.id || window.localStorage.getItem('userId')
    if (!userId) return

    setHistoryLoading(true)
    try {
      const data = await chatService.listConversations(userId)
      setConversationList(data.conversations || [])
    } catch (_err) {
      setConversationList([])
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  const openConversation = useCallback(async (id) => {
    if (!id) return
    setHistoryLoading(true)
    try {
      const data = await chatService.getConversation(id)
      const convo = data.conversation || {}
      const mapped = Array.isArray(convo.messages)
        ? convo.messages.map((msg, idx) => ({
          id: `${id}-${idx}`,
          role: msg.role === 'assistant' ? 'ai' : 'user',
          text: msg.content || '',
        }))
        : []
      setConversationId(id)
      setMessages(mapped.length ? mapped : messages)
      setHistoryOpen(false)
    } catch (_err) {
      // ignore
    } finally {
      setHistoryLoading(false)
    }
  }, [messages])

  const send = useCallback(
    async (overrideText) => {
      const text = typeof overrideText === 'string' ? overrideText : input
      if (!text.trim()) return

      // If we have pending flashcards waiting for topic name
      if (pendingFlashcards.length > 0) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'user', text: `Topic: ${text}` },
        ])
        setInput('')
        setIsTyping(true)

        try {
          // Send topic name with a special marker to save flashcards
          const data = await chatService.sendMessageWithTopic(text, conversationId, pendingFlashcards, user)
          if (data.conversationId) {
            setConversationId(data.conversationId)
          }
          setPendingFlashcards([])
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              role: 'ai',
              text: data.reply || data.message || 'Flashcards saved!',
              flashcards: Array.isArray(data.flashcards) ? data.flashcards : undefined,
            },
          ])
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            { id: Date.now() + 1, role: 'ai', text: `Error: ${err.message}` },
          ])
        } finally {
          setIsTyping(false)
        }
        return
      }

      const userMsg = { id: Date.now(), role: 'user', text }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)

      try {
        const data = await chatService.sendMessage(text, conversationId, mode, user)
        if (data.conversationId) {
          setConversationId(data.conversationId)
        }

        // Check if AI is asking for topic name
        if (data.pendingTopic && data.flashcards && data.flashcards.length === 0) {
          setPendingFlashcards(data.rawFlashcards || [])
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            text: data.reply || data.message || 'Sorry, I could not process that.',
            flashcards: Array.isArray(data.flashcards) && data.flashcards.length > 0
              ? data.flashcards
              : undefined,
            pendingTopic: data.pendingTopic || false,
          },
        ])
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'ai', text: `Error: ${err.message}` },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    [input, conversationId, mode, user, pendingFlashcards],
  )

  const handleQuick = useCallback(
    (text) => {
      setInput(text)
      send(text)
    },
    [send],
  )

  const startNewSession = useCallback(() => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    setMessages([
      { id: Date.now(), role: 'ai', text: 'Hi! Ask me anything about English, TOEIC, IELTS, or daily communication.' },
    ])
    setInput('')
    setConversationId(newConversationId)
    setIsTyping(false)
    setPendingFlashcards([])
    setHistoryOpen(false)
  }, [])

  useEffect(() => {
    loadConversationList()
  }, [loadConversationList])

  return {
    messages,
    input,
    setInput,
    isTyping,
    mode,
    setMode,
    send,
    handleQuick,
    conversationId,
    startNewSession,
    pendingFlashcards,
    conversationList,
    historyOpen,
    setHistoryOpen,
    historyLoading,
    openConversation,
    loadConversationList,
  }
}
