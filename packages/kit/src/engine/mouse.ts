import type { KeyboardTarget } from './keyboard'

export interface MouseOptions {
  win?: Window
  /** Milliseconds after an accepted advance during which another click is ignored (a double click counts once). */
  advanceGuardMs?: number
  /** Clock for the guard (tests). Default `performance.now`. */
  now?: () => number
}

/**
 * A mouse as a clicker: left click advances, right click goes back (its menu is suppressed), and the side buttons of
 * a mouse that has them do the same (forward, back). The middle button and the wheel do nothing, so a stray scroll
 * never moves the show. On the black screen any of them only lifts the black, as the keys do.
 */
export function bindMouse(deck: KeyboardTarget, opts: MouseOptions = {}): () => void {
  const win = opts.win ?? window
  const guardMs = opts.advanceGuardMs ?? 0
  const now = opts.now ?? (() => win.performance.now())
  let lastAdvance = -Infinity

  const onDown = (e: MouseEvent) => {
    const forward = e.button === 0 || e.button === 4
    const back = e.button === 2 || e.button === 3
    if (!forward && !back) return
    e.preventDefault()
    if (deck.isBlack()) {
      deck.toggleBlack()
      return
    }
    if (back) {
      void deck.prev()
      return
    }
    const t = now()
    if (t - lastAdvance < guardMs) return
    lastAdvance = t
    void deck.next()
  }
  // The right button's menu, and the browser's own back/forward on the side buttons, must never open.
  const block = (e: Event) => e.preventDefault()
  const blockSide = (e: MouseEvent) => {
    if (e.button === 3 || e.button === 4) e.preventDefault()
  }

  win.addEventListener('mousedown', onDown)
  win.addEventListener('contextmenu', block)
  win.addEventListener('mouseup', blockSide)
  win.addEventListener('auxclick', blockSide)
  return () => {
    win.removeEventListener('mousedown', onDown)
    win.removeEventListener('contextmenu', block)
    win.removeEventListener('mouseup', blockSide)
    win.removeEventListener('auxclick', blockSide)
  }
}
