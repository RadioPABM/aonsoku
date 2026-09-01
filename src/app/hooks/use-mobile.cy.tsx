import { useIsMobile } from '@/app/hooks/use-mobile'

function Probe() {
  const isMobile = useIsMobile()

  return (
    <div data-testid="probe">
      {String(isMobile)} @ {window.innerWidth}
    </div>
  )
}

describe('useIsMobile', () => {
  it('reports mobile at 390', () => {
    cy.viewport(390, 400)
    cy.mount(<Probe />)
    cy.getByTestId('probe').should('contain.text', 'true')
  })

  it('reports desktop at 1100', () => {
    cy.viewport(1100, 400)
    cy.mount(<Probe />)
    cy.getByTestId('probe').should('contain.text', 'false')
  })
})
