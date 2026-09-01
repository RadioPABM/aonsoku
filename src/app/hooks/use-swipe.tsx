import { useCallback, useRef, useState } from 'react'

const DIRECTION_SLOP = 12
const DEFAULT_THRESHOLD = 60
const RESISTANCE = 0.4

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  /** Distance in pixels the finger has to travel to fire the callback. */
  threshold?: number
  disabled?: boolean
}

/**
 * Horizontal swipe over an element. Vertical movement is left alone so the
 * drawer this usually lives in can still be dragged down to close.
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = DEFAULT_THRESHOLD,
  disabled = false,
}: UseSwipeOptions) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const direction = useRef<'none' | 'horizontal' | 'vertical'>('none')
  const [offset, setOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const reset = useCallback(() => {
    start.current = null
    direction.current = 'none'
    setOffset(0)
    setIsSwiping(false)
  }, [])

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || event.touches.length !== 1) return

      const touch = event.touches[0]
      start.current = { x: touch.clientX, y: touch.clientY }
      direction.current = 'none'
    },
    [disabled],
  )

  const onTouchMove = useCallback((event: React.TouchEvent) => {
    if (!start.current) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - start.current.x
    const deltaY = touch.clientY - start.current.y

    if (direction.current === 'none') {
      if (
        Math.abs(deltaX) < DIRECTION_SLOP &&
        Math.abs(deltaY) < DIRECTION_SLOP
      )
        return

      direction.current =
        Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'

      if (direction.current === 'horizontal') setIsSwiping(true)
    }

    if (direction.current !== 'horizontal') return

    setOffset(deltaX * RESISTANCE)
  }, [])

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!start.current || direction.current !== 'horizontal') {
        reset()
        return
      }

      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - start.current.x

      if (deltaX <= -threshold) onSwipeLeft?.()
      if (deltaX >= threshold) onSwipeRight?.()

      reset()
    },
    [onSwipeLeft, onSwipeRight, reset, threshold],
  )

  return {
    offset,
    isSwiping,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: reset,
    },
  }
}
