import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import chatService from '../services/chat.service'

const scenarios = [
  {
    id: 'coffee',
    label: 'Order Drinks',
    title: 'Ordering Coffee',
    subtitle: 'Cafe counter',
    assistant: 'BARISTA',
    intro: 'Good morning! Welcome in. I can help you choose a drink, size, and milk option. What would you like today?',
    quickReplies: ['Can I see the menu?', 'What sizes do you have?', 'Do you have oat milk?'],
  },
  {
    id: 'restaurant',
    label: 'Order Food',
    title: 'Ordering Food',
    subtitle: 'Restaurant table',
    assistant: 'WAITER',
    intro: 'Hello! Here is the menu. I can recommend a few dishes if you want. Are you ready to order?',
    quickReplies: ['Can I see the menu?', 'I want the chicken salad.', 'Could we get the bill?'],
  },
  {
    id: 'airport',
    label: 'At the Airport',
    title: 'Airport Check-in',
    subtitle: 'Flight counter',
    assistant: 'AGENT',
    intro: 'Good afternoon. May I see your passport and ticket? I can also help with baggage and gate information.',
    quickReplies: ['I want to check in.', 'Is my bag overweight?', 'Where is the gate?'],
  },
  {
    id: 'hotel',
    label: 'Book Hotel',
    title: 'Hotel Reservation',
    subtitle: 'Front desk',
    assistant: 'RECEPTIONIST',
    intro: 'Welcome! Do you have a reservation? I can help with room type, breakfast, and late checkout.',
    quickReplies: ['I have a booking under Hao.', 'Is breakfast included?', 'Can I get a late checkout?'],
  },
]

export default function useRoleplay() {
  const { user } = useAuth()
  const [scenarioId, setScenarioId] = useState('coffee')
  const scenario = useMemo(() => scenarios.find((item) => item.id === scenarioId) || scenarios[0], [scenarioId])
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', label: scenario.assistant, text: scenario.intro },
  ])
  const [input, setInput] = useState('')
  const [step, setStep] = useState(1)
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [animating, setAnimating] = useState(false)

  const changeScenario = useCallback((nextScenarioId) => {
    const next = scenarios.find((item) => item.id === nextScenarioId) || scenarios[0]
    setAnimating(true)
    setScenarioId(next.id)
    setMessages([{ id: Date.now(), role: 'ai', label: next.assistant, text: next.intro }])
    setInput('')
    setConversationId(null)
    setStep(1)
    window.setTimeout(() => setAnimating(false), 250)
  }, [])

  const send = useCallback(
    async (overrideText) => {
      const text = typeof overrideText === 'string' ? overrideText : input
      if (!text.trim()) return

      const userMsg = { id: Date.now(), role: 'user', label: 'YOU', text }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)
      setStep((s) => s + 1)

      try {
        const data = await chatService.sendMessage(text, conversationId, 'roleplay', user, {
          id: scenario.id,
          title: scenario.title,
          subtitle: scenario.subtitle,
          assistant: scenario.assistant,
        })
        if (data.conversationId) {
          setConversationId(data.conversationId)
        }
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            label: scenario.assistant,
            text: data.reply || data.message || 'Okay. Please continue the roleplay.',
          },
        ])
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'ai', label: scenario.assistant, text: `Error: ${err.message}` },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    [conversationId, input, scenario, user],
  )

  const handleQuick = useCallback(
    (text) => {
      setInput(text)
      send(text)
    },
    [send],
  )

  return {
    animating,
    changeScenario,
    messages,
    input,
    setInput,
    step,
    isTyping,
    send,
    handleQuick,
    quickReplies: scenario.quickReplies,
    scenario,
    scenarios,
  }
}
