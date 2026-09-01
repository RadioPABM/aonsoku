import { useCallback, useRef, useState } from 'react'

const DIRECTION_SLOP = 12
/** How far a finger must travel before the swipe is taken as committed. */
const COMMIT_RATIO = 0.22
const MAX_COMMIT_DISTANCE = 110
/** Resistance applied when there is nothing to swipe towards. */
const RUBBER_BAND = 0.25
const SETTLE_MS = 260

type Phase = 'idle' | 'dragging' | 'settling'

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  /** Whether there is anything to reveal on that side. */
  canSwipeLeft?: boolean
  canSwipeRight?: boolean
  disabled?: boolean
}

/**
 * A horizontal swipe that carries the content off the screen instead of
 * nudging it. The offset is meant to be applied to a track holding the
 * previous, current and next item, so the neighbour is already sliding in
 * while the current one leaves.
 *
 * Vertical movement is left alone, so the sheet this lives in can still be
 * dragged down to close.
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft = true,
  canSwipeRight = true,
  disabled = false,
}: UseSwipeOptions) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const width = useRef(0)
  const direction = useRef<'none' | 'horizontal' | 'vertical'>('none')
  const committed = useRef<'left' | 'right' | null>(null)

  const [offset, setOffset] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')

  const reset = useCallback(() => {
    start.current = null
    direction.current = 'none'
    committed.current = null
    setOffset(0)
    setPhase('idle')
  }, [])

  const onTouchStart = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (disabled || event.touches.length !== 1) return

      // A new gesture during the settle animation would fight it.
      if (phase === 'settling') return

      const touch = event.touches[0]
      start.current = { x: touch.clientX, y: touch.clientY }
      width.current = event.currentTarget.offsetWidth || 1
      direction.current = 'none'
    },
    [disabled, phase],
  )

  const onTouchMove = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
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

        if (direction.current === 'horizontal') setPhase('dragging')
      }

      if (direction.current !== 'horizontal') return

      // Dragging towards an end of the queue pulls against a rubber band, so
      // the gesture answers without promising a track that is not there.
      const towardsEnd =
        (deltaX < 0 && !canSwipeLeft) || (deltaX > 0 && !canSwipeRight)

      // Never past one slide: there is no fourth item behind the neighbour,
      // and an offset that already equals the settle target would leave no
      // transition to wait for.
      const limit = width.current - 1
      const travel = towardsEnd ? deltaX * RUBBER_BAND : deltaX

      setOffset(Math.max(Math.min(travel, limit), -limit))
    },
    [canSwipeLeft, canSwipeRight],
  )

  const onTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (!start.current || direction.current !== 'horizontal') {
        reset()
        return
      }

      const deltaX = event.changedTouches[0].clientX - start.current.x
      const threshold = Math.min(
        width.current * COMMIT_RATIO,
        MAX_COMMIT_DISTANCE,
      )

      const goesLeft = deltaX <= -threshold && canSwipeLeft
      const goesRight = deltaX >= threshold && canSwipeRight

      start.current = null
      direction.current = 'none'
      setPhase('settling')

      if (goesLeft || goesRight) {
        committed.current = goesLeft ? 'left' : 'right'
        setOffset(goesLeft ? -width.current : width.current)
        return
      }

      setOffset(0)
    },
    [canSwipeLeft, canSwipeRight, reset],
  )

  /**
   * The swap happens once the item has actually left, and the track snaps
   * back to centre in the same render, so the neighbour that just arrived
   * stays exactly where the finger left it.
   */
  const onTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLElement>) => {
      // The covers fade in with their own transition, which bubbles through
      // this same element; only the track's own slide is the swap signal.
      if (event.propertyName !== 'transform') return
      if (event.target !== event.currentTarget) return
      if (phase !== 'settling') return

      const direction = committed.current
      committed.current = null

      setPhase('idle')
      setOffset(0)

      if (direction === 'left') onSwipeLeft?.()
      if (direction === 'right') onSwipeRight?.()
    },
    [onSwipeLeft, onSwipeRight, phase],
  )

  return {
    isDragging: phase === 'dragging',
    /** Goes on the element the finger touches, which also sets the width. */
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: reset,
    },
    /** Goes on the track holding the previous, current and next item. */
    trackProps: {
      style: {
        transform: `translate3d(calc(-100% + ${offset}px), 0, 0)`,
        transition:
          phase === 'settling' ? `transform ${SETTLE_MS}ms ease-out` : 'none',
      },
      onTransitionEnd,
    },
  }
}
