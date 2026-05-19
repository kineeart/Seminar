import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import chatService from '../services/chat.service'

const CHAT_STORAGE_KEY = 'chat_state_knowledge_v1'

export default function useChat() {
  const { user } = useAuth()
  const initialState = useMemo(() => {
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed.messages) || !parsed.messages.length) return null
      return parsed
    } catch (_err) {
      return null
    }
  }, [])

  const [messages, setMessages] = useState(initialState?.messages || [
    { id: 1, role: 'ai', text: 'Hi! Ask me anything about English, TOEIC, IELTS, or daily communication.' },
  ])
  const [input, setInput] = useState(initialState?.input || '')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState(initialState?.mode || 'knowledge')
  const [conversationId, setConversationId] = useState(initialState?.conversationId || null)
  const [pendingFlashcards, setPendingFlashcards] = useState([])

  useEffect(() => {
    const snapshot = {
      messages,
      input,
      mode,
      conversationId,
      pendingFlashcards,
    }
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(snapshot))
  }, [messages, input, mode, conversationId])

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
    setMessages([
      { id: Date.now(), role: 'ai', text: 'Hi! Ask me anything about English, TOEIC, IELTS, or daily communication.' },
    ])
    setInput('')
    setConversationId(null)
    setIsTyping(false)
    setPendingFlashcards([])
  }, [])

  return { messages, input, setInput, isTyping, mode, setMode, send, handleQuick, conversationId, startNewSession, pendingFlashcards }
}
