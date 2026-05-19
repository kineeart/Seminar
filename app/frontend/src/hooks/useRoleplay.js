import { useCallback, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import chatService from '../services/chat.service'

const SCENARIOS = [
  { id: 'coffee', title: 'Cafe Counter', subtitle: 'Order Drinks', icon: '☕', goal: 'Order a drink, choose size & milk, then pay.' },
  { id: 'food', title: 'Restaurant', subtitle: 'Order Food', icon: '🍽️', goal: 'Order a meal, confirm your order, ask for the bill.' },
  { id: 'airport', title: 'At the Airport', subtitle: 'Check-in & Board', icon: '✈️', goal: 'Show documents, check baggage, choose seat, get boarding pass.' },
  { id: 'hotel', title: 'Hotel', subtitle: 'Book & Check-in', icon: '🏨', goal: 'Confirm reservation, provide ID, get room key, ask about facilities.' },
]

const GREETINGS = {
  coffee: 'Good morning! Welcome in. What can I get started for you today?',
  food: 'Good evening! Welcome to The Garden Bistro. Can I start you off with something to drink, or would you like to see the menu?',
  airport: 'Good morning! Welcome to Sky Airlines check-in. May I see your passport and booking confirmation, please?',
  hotel: 'Good afternoon! Welcome to The Grand Hotel. Do you have a reservation, or would you like to book a room?',
}

const ROLES = {
  coffee: 'BARISTA',
  food: 'WAITER',
  airport: 'AGENT',
  hotel: 'RECEPTIONIST',
}

export default function useRoleplay() {
  const { user } = useAuth()
  const [scenario, setScenario] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [goalProgress, setGoalProgress] = useState(null)
  const [isComplete, setIsComplete] = useState(false)

  const startScenario = useCallback((scenarioId) => {
    setScenario(scenarioId)
    setMessages([
      { id: 1, role: 'ai', label: ROLES[scenarioId], text: GREETINGS[scenarioId] },
    ])
    setConversationId(null)
    setGoalProgress(null)
    setIsComplete(false)
  }, [])

  const resetScenario = useCallback(() => {
    setScenario(null)
    setMessages([])
    setConversationId(null)
    setGoalProgress(null)
    setIsComplete(false)
  }, [])

  const send = useCallback(
    async (overrideText) => {
      const text = typeof overrideText === 'string' ? overrideText : input
      if (!text.trim() || isComplete) return

      const userMsg = { id: Date.now(), role: 'user', label: 'YOU', text }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsTyping(true)

      try {
        const data = await chatService.sendMessage(text, conversationId, 'roleplay', user, scenario)
        if (data.conversationId) {
          setConversationId(data.conversationId)
        }

        // Handle goal progress
        if (data.goalProgress) {
          setGoalProgress(data.goalProgress)
          if (data.goalProgress.isComplete) {
            setIsComplete(true)
            // Add AI reply + completion message
            setMessages((prev) => [
              ...prev,
              { id: Date.now() + 1, role: 'ai', label: ROLES[scenario], text: data.reply || '' },
              { id: Date.now() + 2, role: 'system', text: data.goalProgress.completionMessage },
            ])
            setIsTyping(false)
            return
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ai',
            label: ROLES[scenario],
            text: data.reply || data.message || 'Sorry, could you repeat that?',
          },
        ])
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'ai', label: ROLES[scenario], text: `Error: ${err.message}` },
        ])
      } finally {
        setIsTyping(false)
      }
    },
    [input, conversationId, user, scenario, isComplete],
  )

  const handleQuick = useCallback(
    (text) => {
      setInput(text)
      send(text)
    },
    [send],
  )

  return {
    scenarios: SCENARIOS,
    scenario,
    messages,
    input,
    setInput,
    isTyping,
    goalProgress,
    isComplete,
    startScenario,
    resetScenario,
    send,
    handleQuick,
  }
}
