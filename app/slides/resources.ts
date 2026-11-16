import { defineSlide } from '@deck/kit'
import { follow, practise, type Resource } from '../content/resources'
import { qrSvg } from '../src/card'
import { el } from '../src/dom'
import { world } from '../src/world/world'
import { fadeUp, howFrom } from './common'

const ICONS: Record<Resource['kind'], string> = {
  tiktok:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 3.5v10.8a3.6 3.6 0 1 1-3.6-3.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M14.2 3.5c.5 2.6 2.4 4.4 5 4.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
  web:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
}
const PLATFORM: Record<Resource['kind'], string> = { tiktok: 'TikTok', instagram: 'Instagram', web: 'Website' }

function card(parent: HTMLElement, r: Resource): HTMLElement {
  const c = el('div', `rs-card rs-${r.kind}`, parent)
  const qr = el('div', 'rs-qr', c)
  qr.innerHTML = qrSvg(r.url)
  const body = el('div', 'rs-body', c)
  const head = el('div', 'rs-head', body)
  const icon = el('span', 'rs-icon', head)
  icon.innerHTML = ICONS[r.kind]
  el('span', '', head).textContent = PLATFORM[r.kind]
  if (r.language) el('span', 'rs-lang', head).textContent = r.language
  el('div', 'rs-name', body).textContent = r.name
  el('div', 'rs-about', body).textContent = r.about
  el('div', 'rs-url', body).textContent = r.shown
  return c
}

/**
 * Before the credits: where to keep practising. Three accounts to follow (English, Arabic, French) and three sites to
 * practise on, each with a QR code to scan from the seat.
 */
export default defineSlide({
  id: 'resources',
  claim: 'Keep practising: three accounts to follow and three sites to practise on.',
  notes: 'After the bow. Leave it up while people scan the codes. Next PRESS: the credits.',
  transition: 'fade',
  build({ stage, tl }) {
    const box = el('div', 'rs', stage)
    const head = el('div', 'rs-title', box)
    const kicker = el('div', 'eyebrow-mono', head)
    kicker.textContent = 'Before your next panel interview'
    const title = el('div', 'rs-h', head)
    title.innerHTML = 'Keep <em>practising</em>'
    const groups: HTMLElement[] = []
    const cards: HTMLElement[] = []
    for (const [label, list] of [['Follow', follow], ['Practise', practise]] as const) {
      const g = el('div', 'rs-group', box)
      el('div', 'rs-group-title', g).textContent = label
      const row = el('div', 'rs-row', g)
      for (const r of list) cards.push(card(row, r))
      groups.push(g)
    }
    const foot = el('div', 'rs-foot', box)
    foot.textContent = 'Scan a code with your phone camera'

    fadeUp(tl, kicker, 0.3, 10, 1)
    fadeUp(tl, title, 0.4, 24, 1.3)
    fadeUp(tl, groups.map((g) => g.firstElementChild as HTMLElement), 0.8, 8, 0.8)
    tl.fromTo(cards, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09 }, 0.9)
    tl.fromTo(cards.map((c) => c.querySelector('.rs-qr')!), { scale: 0.85 }, { scale: 1, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.09 }, 1.0)
    fadeUp(tl, foot, 1.8, 6, 1)
    tl.addLabel('step-0')
  },
  enter({ direction }) {
    world.go({ mode: 'credits', scene: 7, filled: 7 }, howFrom(direction))
  },
})
