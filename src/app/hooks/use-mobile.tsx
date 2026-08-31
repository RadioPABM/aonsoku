import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 768

function checkIsMobile() {
  if (typeof window === 'undefined') return false

  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  // Resolved on the first render so the mobile shell is not mounted after a
  // desktop one, which would remount the whole tree.
  const [isMobile, setIsMobile] = useState<boolean>(checkIsMobile)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(checkIsMobile())
    }
    mql.addEventListener('change', onChange)
    onChange()
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
