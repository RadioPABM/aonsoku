import { AlbumsHeader } from '@/app/components/albums/header'

const GENRES = {
  'subsonic-response': {
    status: 'ok',
    genres: { genre: [{ value: 'Rock', songCount: 10, albumCount: 2 }] },
  },
}

function mountHeader(width: number, search: string) {
  cy.viewport(width, 220)
  cy.intercept('/rest/getGenres**', { body: GENRES })
  cy.changeLang('ru')

  cy.mount(<AlbumsHeader albumCount={1234} />, {
    routerProps: { initialEntries: [`/library/albums${search}`] },
  })
}

describe('AlbumsHeader', () => {
  it('keeps the active filter readable beside the genre picker', () => {
    // Russian labels and a narrow window: the row the genre picker joins is
    // where the main filter used to be squeezed down to its icon.
    mountHeader(500, '?filter=byGenre')

    cy.get('[data-testid="albums-main-filter"]')
      .find('span')
      .should(($label) => {
        const element = $label[0]

        // Truncated to nothing, the button is left centring the icon and its
        // margin, which is what pushed the icon off centre.
        expect(element.scrollWidth, 'label is not clipped').to.be.at.most(
          element.clientWidth + 1,
        )
      })
  })
})
