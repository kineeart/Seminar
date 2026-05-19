import { useCallback, useRef, useState } from 'react'

const SWIPE_THRESHOLD = 100

export default function useSwipe({ onSwipeLeft, onSwipeRight, onTap }) {
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [swiped, setSwiped] = useState(null)

  const startRef = useRef({ x: 0, y: 0 })
  const movedRef = useRef(false)
  const activeRef = useRef(false)

  const onPointerDown = useCallback((e) => {
    if (swiped) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startRef.current = { x: e.clientX, y: e.clientY }
    movedRef.current = false
    activeRef.current = true
    setDragging(true)
    setDx(0)
    setDy(0)
  }, [swiped])

  const onPointerMove = useCallback((e) => {
    if (!activeRef.current) return
    const newDx = e.clientX - startRef.current.x
    const newDy = e.clientY - startRef.current.y
    if (Math.abs(newDx) > 5 || Math.abs(newDy) > 5) movedRef.current = true
    setDx(newDx)
    setDy(newDy)
  }, [])

  const onPointerUp = useCallback(() => {
    if (!activeRef.current) return
    activeRef.current = false
    setDragging(false)

    if (!movedRef.current) {
      // It was a tap, not a drag
      setDx(0)
      setDy(0)
      onTap?.()
      return
    }

    if (dx > SWIPE_THRESHOLD) {
      setSwiped('right')
      onSwipeRight?.()
      setTimeout(() => { setSwiped(null); setDx(0); setDy(0) }, 50)
    } else if (dx < -SWIPE_THRESHOLD) {
      setSwiped('left')
      onSwipeLeft?.()
      setTimeout(() => { setSwiped(null); setDx(0); setDy(0) }, 50)
    } else {
      // Snap back
      setDx(0)
      setDy(0)
    }
  }, [dx, onSwipeLeft, onSwipeRight, onTap])

  const cardStyle = dragging && movedRef.current
    ? {
        transform: `translate(${dx}px, ${dy * 0.3}px) rotate(${dx / 20}deg)`,
        transition: 'none',
      }
    : {}

  const overlayOpacity = Math.min(Math.abs(dx) / SWIPE_THRESHOLD, 1)
  const showCorrect = dx > 0 ? overlayOpacity : 0
  const showWrong = dx < 0 ? overlayOpacity : 0

  return {
    cardStyle,
    showCorrect,
    showWrong,
    dragging,
    swiped,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  }
}
