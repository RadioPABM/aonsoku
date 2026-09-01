import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { mount } from 'cypress/react'
import { DataTable } from '@/app/components/ui/data-table'
import { songsColumns } from '@/app/tables/songs-columns'
import { ColumnFilter } from '@/types/columnFilter'
import { ISong } from '@/types/responses/song'

const COLUMNS: ColumnFilter[] = ['trackNumber', 'title', 'duration', 'select']
const ROW = '[data-test-id="table-row"]'
const MENU_BUTTON = 'button:has(svg.lucide-ellipsis-vertical)'

/** The row menu reads the route, so it needs a data router to render at all. */
function mountRows(songs: ISong[]) {
  const queryClient = new QueryClient()

  const router = createMemoryRouter(
    [
      {
        path: '/library/albums/:albumId',
        element: (
          <DataTable
            columns={songsColumns()}
            data={songs.slice(0, 3)}
            columnFilter={COLUMNS}
            variant="modern"
            handlePlaySong={() => {}}
          />
        ),
      },
    ],
    { initialEntries: ['/library/albums/1'] },
  )

  mount(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('Row menu on touch', () => {
  beforeEach(() => {
    cy.viewport(390, 700)
    cy.mockCoverArt()
    cy.changeLang('en-US')
    cy.intercept('/rest/getPlaylists**', {
      body: { 'subsonic-response': { status: 'ok', playlists: {} } },
    })
  })

  it('opens and runs an item', () => {
    cy.fixture('songs/random').then((songs: ISong[]) => {
      mountRows(songs)

      cy.get(ROW).first().find(MENU_BUTTON).realClick({ pointer: 'touch' })

      cy.contains('Play next').should('be.visible')
      cy.contains('Play next').realClick({ pointer: 'touch' })

      // Choosing an item closes the menu; if the tap never lands it stays open.
      cy.contains('Play next').should('not.exist')
    })
  })
})
