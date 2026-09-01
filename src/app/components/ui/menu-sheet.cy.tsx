import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'

function Harness({ onPick }: { onPick: (what: string) => void }) {
  return (
    <div className="h-[560px] w-full bg-background p-4">
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onPick('play-next')}>
            Play next
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Add to playlist</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onPick('playlist-one')}>
                  My playlist
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

describe('Menu sheet on touch', () => {
  beforeEach(() => {
    cy.viewport(390, 560)
  })

  it('runs an item when it is tapped', () => {
    const onPick = cy.stub().as('pick')
    cy.mount(<Harness onPick={onPick} />)

    cy.contains('Play next').realClick({ pointer: 'touch' })

    cy.get('@pick').should('have.been.calledWith', 'play-next')
  })

  it('is tappable over the fixed bar at the same edge', () => {
    const onPick = cy.stub().as('pick')

    cy.mount(
      <>
        <Harness onPick={onPick} />
        {/* What the mobile shell keeps pinned to this edge. */}
        <div className="fixed bottom-0 left-0 right-0 z-40 h-28 bg-background" />
      </>,
    )

    cy.contains('Play next').realClick({ pointer: 'touch' })

    cy.get('@pick').should('have.been.calledWith', 'play-next')
  })

  it('opens the submenu and runs an item inside it', () => {
    const onPick = cy.stub().as('pick')
    cy.mount(<Harness onPick={onPick} />)

    cy.contains('Add to playlist').click()
    cy.contains('My playlist').should('be.visible').click()

    cy.get('@pick').should('have.been.calledWith', 'playlist-one')
  })
})
