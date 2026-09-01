import { PlayerExpandButton } from './expand-button'

describe('PlayerExpandButton Component', () => {
  it('should render the button enabled', () => {
    cy.mount(<PlayerExpandButton disabled={false} />)

    cy.getByTestId('track-fullscreen-button')
      .should('be.visible')
      .and('be.enabled')

    cy.getByTestId('track-fullscreen-icon').should('be.visible')
  })

  it('should render the button disabled when there is no song', () => {
    cy.mount(<PlayerExpandButton disabled={true} />)

    cy.getByTestId('track-fullscreen-button').should('be.disabled')
  })

  describe('English', () => {
    beforeEach(() => {
      cy.changeLang('en-US')
    })

    it('should show the tooltip on hover', () => {
      cy.mount(<PlayerExpandButton disabled={false} />)

      cy.getByTestId('track-fullscreen-button').wait(1500).realHover()
      cy.contains('Switch to Big Player').should('be.visible')
    })
  })

  describe('Portuguese', () => {
    beforeEach(() => {
      cy.changeLang('pt-BR')
    })

    it('should show the tooltip on hover', () => {
      cy.mount(<PlayerExpandButton disabled={false} />)

      cy.getByTestId('track-fullscreen-button').wait(1500).realHover()
      cy.contains('Alternar para o Player Grande').should('be.visible')
    })
  })
})
