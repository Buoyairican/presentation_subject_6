// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { bindMouse } from './mouse'
import type { KeyboardTarget } from './keyboard'

function target(): KeyboardTarget {
  let black = false
  return {
    next: vi.fn(async () => {}),
    prev: vi.fn(async () => {}),
    goTo: vi.fn(async () => {}),
    stepCounts: [1, 1, 1],
    toggleBlack: vi.fn(() => {
      black = !black
    }),
    isBlack: () => black,
  }
}
const click = (button: number) => {
  const e = new MouseEvent('mousedown', { button, bubbles: true, cancelable: true })
  window.dispatchEvent(e)
  return e
}

describe('bindMouse', () => {
  it('left click advances, right click goes back, side buttons too; middle does nothing', () => {
    const d = target()
    const unbind = bindMouse(d)
    expect(click(0).defaultPrevented).toBe(true)
    click(4)
    click(2)
    click(3)
    click(1)
    expect(d.next).toHaveBeenCalledTimes(2)
    expect(d.prev).toHaveBeenCalledTimes(2)
    unbind()
    click(0)
    expect(d.next).toHaveBeenCalledTimes(2)
  })

  it('suppresses the right-click menu', () => {
    const unbind = bindMouse(target())
    const e = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    window.dispatchEvent(e)
    expect(e.defaultPrevented).toBe(true)
    unbind()
  })

  it('counts a double click once, and goes back on every right click', () => {
    const d = target()
    let t = 0
    const unbind = bindMouse(d, { advanceGuardMs: 700, now: () => t })
    click(0)
    t = 150
    click(0)
    expect(d.next).toHaveBeenCalledTimes(1)
    t = 900
    click(0)
    expect(d.next).toHaveBeenCalledTimes(2)
    click(2)
    click(2)
    expect(d.prev).toHaveBeenCalledTimes(2)
    unbind()
  })

  it('on the black screen, a click only lifts the black', () => {
    const d = target()
    d.toggleBlack()
    const unbind = bindMouse(d)
    click(0)
    expect(d.isBlack()).toBe(false)
    expect(d.next).not.toHaveBeenCalled()
    unbind()
  })
})
