import { useSwipe } from '@/app/hooks/use-swipe'

const SURFACE = '[data-testid="swipe-surface"]'

function Harness({ onNext }: { onNext: () => void }) {
  const { handlers, trackProps } = useSwipe({
    onSwipeLeft: onNext,
    onSwipeRight: () => {},
  })

  return (
    <div data-testid="swipe-surface" style={{ width: 300 }} {...handlers}>
      <div data-testid="swipe-track" {...trackProps}>
        cover
      </div>
    </div>
  )
}

function touch(event: string, x: number) {
  const point = [{ clientX: x, clientY: 0 }]

  cy.get(SURFACE).trigger(event, {
    touches: point,
    changedTouches: point,
  })
}

describe('useSwipe', () => {
  it('commits a swipe that passes the threshold', () => {
    const onNext = cy.stub().as('next')
    cy.mount(<Harness onNext={onNext} />)

    touch('touchstart', 200)
    touch('touchmove', 100)
    touch('touchend', 100)

    cy.get('@next').should('have.been.calledOnce')
  })

  it('stays usable after a gesture that ends where it began', () => {
    const onNext = cy.stub().as('next')
    cy.mount(<Harness onNext={onNext} />)

    // Past the direction threshold and back to the exact start: the track is
    // already where it would settle, so nothing animates and no transition
    // ends. Without a way out of that the gesture would be dead from here on.
    touch('touchstart', 150)
    touch('touchmove', 180)
    touch('touchmove', 150)
    touch('touchend', 150)

    cy.get('@next').should('not.have.been.called')

    touch('touchstart', 200)
    touch('touchmove', 100)
    touch('touchend', 100)

    cy.get('@next').should('have.been.calledOnce')
  })
})
