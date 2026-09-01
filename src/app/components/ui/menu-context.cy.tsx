import { ContextMenuProvider } from '@/app/components/table/context-menu'
import { ContextMenuItem } from '@/app/components/ui/context-menu'

function Harness({ onPick }: { onPick: () => void }) {
  return (
    <div className="h-[600px] w-full bg-background p-4">
      <ContextMenuProvider
        options={<ContextMenuItem onClick={onPick}>Play next</ContextMenuItem>}
      >
        <div data-testid="row" className="h-16 w-full bg-accent">
          A row
        </div>
      </ContextMenuProvider>
    </div>
  )
}

describe('Long press menu on touch', () => {
  beforeEach(() => {
    cy.viewport(390, 600)
  })

  it('runs an item that is tapped', () => {
    const onPick = cy.stub().as('pick')
    cy.mount(<Harness onPick={onPick} />)

    cy.getByTestId('row').trigger('contextmenu')

    cy.contains('Play next').should('be.visible')
    cy.contains('Play next').realClick({ pointer: 'touch' })

    cy.get('@pick').should('have.been.called')
  })
})
