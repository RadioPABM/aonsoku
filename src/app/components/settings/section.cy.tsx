import { ContentItemTitle } from '@/app/components/settings/section'

const INFO = 'When enabled, songs you listen to are kept on this device.'

describe('ContentItemTitle info', () => {
  it('opens the text on tap in the mobile layout', () => {
    cy.viewport(390, 844)

    cy.mount(<ContentItemTitle info={INFO}>Keep songs</ContentItemTitle>)

    cy.contains(INFO).should('not.exist')

    cy.get('button').click()

    cy.contains(INFO).should('be.visible')
  })

  it('shows the text on hover on a desktop viewport', () => {
    cy.viewport(1280, 720)

    cy.mount(<ContentItemTitle info={INFO}>Keep songs</ContentItemTitle>)

    cy.getByTestId('settings-info-icon').realHover()

    cy.contains(INFO).should('be.visible')
  })
})
