import { toast } from 'react-toastify'
import { ToastContainer } from '@/app/observers/toast-container'

const MESSAGE = 'Unable to play the song, check the Server!'

function mountAt(width: number) {
  cy.viewport(width, 400)
  cy.mount(
    <div className="h-[400px] w-full bg-background">
      <ToastContainer />
    </div>,
  )
  cy.then(() => toast.error(MESSAGE))
  cy.contains(MESSAGE).should('be.visible')
}

describe('Toasts', () => {
  it('is dismissed by a tap on a phone', () => {
    mountAt(390)

    // Dispatched on the element itself: the toast is position: fixed, and a
    // click aimed by coordinates lands outside the frame in this harness.
    cy.contains(MESSAGE).trigger('click')

    cy.contains(MESSAGE).should('not.exist')
  })

  it('is not dismissed by a click on a pointer layout', () => {
    mountAt(1100)

    cy.contains(MESSAGE).trigger('click')

    cy.contains(MESSAGE).should('be.visible')
  })

  it('carries no close button on a phone', () => {
    mountAt(390)

    cy.contains(MESSAGE).closest('div[id]').find('button').should('not.exist')
  })

  it('keeps its close button on a pointer layout', () => {
    mountAt(1100)

    cy.contains(MESSAGE).closest('div[id]').find('button').should('exist')
  })

  it('is shorter on a phone than on a pointer layout', () => {
    mountAt(390)
    cy.contains(MESSAGE)
      .closest('div[id]')
      .then(($toast) => {
        cy.wrap($toast[0].getBoundingClientRect().height).as('mobileHeight')
      })

    mountAt(1100)
    cy.contains(MESSAGE)
      .closest('div[id]')
      .then(($toast) => {
        cy.get('@mobileHeight').then((mobileHeight) => {
          expect(Number(mobileHeight)).to.be.lessThan(
            $toast[0].getBoundingClientRect().height,
          )
        })
      })
  })
})
