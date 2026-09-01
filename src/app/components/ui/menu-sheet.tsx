/**
 * Turns a Radix menu into a sheet along the bottom of the screen on touch
 * layouts.
 *
 * The popper wrapper Radix positions the menu with carries a transform, which
 * makes it the containing block for anything fixed inside it, so the content
 * cannot pin itself to the viewport. The wrapper is pinned from `index.css`
 * instead, selected by the marker the content carries; these are the classes
 * for the content itself.
 */
export const SHEET_CLASSES =
  'data-[mobile-sheet]:w-screen data-[mobile-sheet]:max-w-none ' +
  'data-[mobile-sheet]:rounded-b-none data-[mobile-sheet]:rounded-t-xl ' +
  'data-[mobile-sheet]:border-x-0 data-[mobile-sheet]:border-b-0 ' +
  'data-[mobile-sheet]:p-2 ' +
  'data-[mobile-sheet]:pb-[calc(0.5rem+var(--mobile-safe-bottom))] ' +
  'data-[mobile-sheet]:shadow-2xl'
