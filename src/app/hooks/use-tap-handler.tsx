import { useCallback, useRef } from 'react'

const TAP_TIMEOUT = 500

/**
 * Distinguishes a tap from a scroll or a long press on touch devices. The state
 * is per instance, so two mounted tables (a song list under the queue drawer,
 * for example) cannot cancel each other's taps.
 */
export function useTapHandler() {
  const isTap = useRef(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  const handleTouchStart = useCallback(() => {
    isTap.current = true
    timeout.current = setTimeout(() => {
      isTap.current = false
    }, TAP_TIMEOUT)
  }, [])

  const handleTouchMove = useCallback(() => {
    isTap.current = false
  }, [])

  const handleTouchCancel = useCallback(() => {
    clearTimeout(timeout.current)
    isTap.current = false
  }, [])

  /** Ends the gesture and reports whether it counted as a tap. */
  const endTap = useCallback(() => {
    clearTimeout(timeout.current)

    const tapped = isTap.current
    isTap.current = false

    return tapped
  }, [])

  return { handleTouchStart, handleTouchMove, handleTouchCancel, endTap }
}
