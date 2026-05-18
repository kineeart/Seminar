import { useState } from 'react'
import { initialMessages, quickReplies, roleplayMessages } from '../data/mockChat'

export function useChatDemo() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState('knowledge')

  const send = (overrideText) => {
    const text = typeof overrideText === 'string' ? overrideText : input
    if (!text.trim()) return

    const userMsg = { id: Date.now(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: "Got it. In real usage, try: 'look up the meaning', 'ask for help', and 'check the answer'.",
        },
      ])
    }, 700)
  }

  const handleQuick = (text) => {
    setInput(text)
    send(text)
  }

  return { messages, input, setInput, isTyping, mode, setMode, send, handleQuick, quickReplies }
}

export function useRoleplayDemo() {
  const [messages, setMessages] = useState(roleplayMessages)
  const [input, setInput] = useState('')
  const [step, setStep] = useState(1)
  const [isTyping, setIsTyping] = useState(false)

  const send = (overrideText) => {
    const text = typeof overrideText === 'string' ? overrideText : input
    if (!text.trim()) return

    const userMsg = { id: Date.now(), role: 'user', label: 'YOU', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setStep((s) => Math.min(8, s + 1))

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          label: 'BARISTA',
          text: 'Sure! That comes to $5.50. Cash or card?',
        },
      ])
    }, 700)
  }

  const handleQuick = (text) => {
    setInput(text)
    send(text)
  }

  return { messages, input, setInput, step, isTyping, send, handleQuick, quickReplies }
}
