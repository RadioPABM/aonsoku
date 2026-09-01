import { Row } from '@tanstack/react-table'
import { DataTable } from '@/app/components/ui/data-table'
import { songsColumns } from '@/app/tables/songs-columns'
import { ColumnFilter } from '@/types/columnFilter'
import { ISong } from '@/types/responses/song'

const columnsToShow: ColumnFilter[] = ['trackNumber', 'title', 'select']

const ROW = '[data-test-id="table-row"]'
const PLAY_TARGET = '[data-row-play-target]'
const LIKE_BUTTON = 'button:has(svg.lucide-heart)'

type TableProps = {
  songs: ISong[]
  onPlay: (row: Row<ISong>) => void
}

function SongTable({ songs, onPlay }: TableProps) {
  return (
    <DataTable
      columns={songsColumns()}
      data={songs}
      columnFilter={columnsToShow}
      handlePlaySong={onPlay}
      variant="modern"
    />
  )
}

function mountTable() {
  const onPlay = cy.stub().as('play')

  cy.mockCoverArt()
  cy.intercept('/rest/star**', { statusCode: 200 }).as('starRequest')
  cy.intercept('/rest/unstar**', { statusCode: 200 })

  cy.fixture('songs/random').then((songs: ISong[]) => {
    cy.mount(<SongTable songs={songs} onPlay={onPlay} />)
  })
}

/** A tap the row handler accepts: down, then up, with no movement between. */
function tap(selector: string) {
  cy.get(ROW).first().find(selector).first().trigger('touchstart')
  cy.get(ROW).first().find(selector).first().trigger('touchend')
}

describe('DataTable row gestures', () => {
  it('plays the song when the title block is tapped', () => {
    mountTable()

    tap(PLAY_TARGET)

    cy.get('@play').should('have.been.calledOnce')
  })

  it('does not play the song when the like button is tapped', () => {
    mountTable()

    tap(LIKE_BUTTON)

    // A synthetic touchend produces no click, so only the row handler is
    // under test here; the double click case below covers the star request.
    cy.get('@play').should('not.have.been.called')
  })

  it('does not play the song when the like button is double clicked', () => {
    mountTable()

    cy.get(ROW).first().find(LIKE_BUTTON).first().dblclick()

    cy.wait('@starRequest')
    cy.get('@play').should('not.have.been.called')
  })
})
