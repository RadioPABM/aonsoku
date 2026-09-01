import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'

function Harness() {
  return (
    <div className="h-[560px] w-full bg-background p-4">
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <button type="button">Open</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Play next</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

describe('Menus on touch', () => {
  it('fills the width and sits on the bottom edge', () => {
    cy.viewport(390, 560)
    cy.mount(<Harness />)

    cy.get('[data-mobile-sheet]').then(($content) => {
      const rect = $content[0].getBoundingClientRect()

      expect(rect.width, 'full width').to.be.closeTo(390, 1)
      expect(rect.left, 'flush left').to.be.closeTo(0, 1)
      expect(rect.bottom, 'on the bottom edge').to.be.closeTo(560, 1)
    })
  })

  it('is left alone on a pointer layout', () => {
    cy.viewport(1100, 560)
    cy.mount(<Harness />)

    cy.get('[data-mobile-sheet]').should('not.exist')

    cy.contains('Play next')
      .parents('[role="menu"]')
      .then(($content) => {
        const rect = $content[0].getBoundingClientRect()

        expect(rect.width, 'sized to its content').to.be.lessThan(400)
      })
  })
})
