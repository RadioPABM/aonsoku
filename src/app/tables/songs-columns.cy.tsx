import { DataTable } from '@/app/components/ui/data-table'
import { songsColumns } from '@/app/tables/songs-columns'
import { ColumnFilter } from '@/types/columnFilter'
import { ISong } from '@/types/responses/song'

const COLUMNS: ColumnFilter[] = [
  'trackNumber',
  'title',
  'duration',
  'playCount',
  'played',
  'bitRate',
  'contentType',
  'select',
]

function mountList(width: number) {
  cy.viewport(width, 420)
  cy.mockCoverArt()

  cy.fixture('songs/random').then((songs: ISong[]) => {
    cy.wrap(songs[0]).as('firstSong')

    cy.mount(
      <div className="bg-background">
        <DataTable
          columns={songsColumns()}
          data={songs.slice(0, 3)}
          columnFilter={COLUMNS}
          variant="modern"
        />
      </div>,
    )
  })
}

const ROW = '[data-test-id="table-row"]'

describe('Song rows', () => {
  it('gives the title the width the duration column used to take', () => {
    mountList(390)

    // The row menu stays on the desktop layout; a long press reaches it here.
    cy.get(ROW)
      .first()
      .find('button:has(svg.lucide-ellipsis-vertical)')
      .should('not.be.visible')

    // The length is not lost, it moves under the title.
    cy.get<ISong>('@firstSong').then((song) => {
      cy.get(ROW).first().should('contain.text', song.artist)
    })

    cy.get(ROW)
      .first()
      .find('[data-row-play-target]')
      .then(($title) => {
        // Wider than the row minus the chrome it still carries: 48px for the
        // number and 56px for the like button, with nothing for the duration.
        expect($title[0].getBoundingClientRect().width).to.be.greaterThan(260)
      })
  })

  it('keeps the duration in its own column on a pointer layout', () => {
    mountList(1280)

    cy.get(ROW).first().findByTestId('row-duration').should('not.be.visible')
  })
})
