import './styles.css'
import { bindKeyboard, bindMouse, createDeck, installTestApi } from '@deck/kit'
import { config, slides } from '../deck.config'
import { registerFonts } from './fonts'
import { skipCurrent } from './media/player'
import { sound } from './sound'
import { world } from './world/world'
import { mountHelp } from './help'

const root = document.getElementById('app')
if (!root) throw new Error('missing #app')

async function start(app: HTMLElement): Promise<void> {
  const params = new URLSearchParams(location.search)
  const qa = params.has('qa')
  await registerFonts()
  void sound.load()

  const deck = createDeck({
    config,
    slides,
    root: app,
    // Full motion even when the laptop has "reduce motion" on: the show is the motion. `?reduced=1` turns it off.
    reduced: params.get('reduced') === '1',
    qa,
    onStage: (stage) => world.mount(stage, { qa }),
  })

  // Every key press or click may be the first one: wake the audio output (browsers only allow sound after one).
  window.addEventListener('keydown', () => sound.unlock(), { capture: true })
  window.addEventListener('mousedown', () => sound.unlock(), { capture: true })
  bindKeyboard(deck, { advanceGuardMs: 700, blockReloadKey: true, forceKeys: ['ArrowRight'] })
  // The Narrator's Bluetooth mouse: left click forward, right click back.
  bindMouse(deck, { advanceGuardMs: 700 })
  hideIdleCursor()
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (e.key === 's' || e.key === 'S') skipCurrent()
  })
  mountHelp(deck)
  installTestApi(deck)
  // Read-only probes for the rehearsal checks (tools/qa): is a clip holding the presses, what the room shows.
  ;(window as unknown as { __show: object }).__show = {
    held: () => deck.isHeld(),
    world: () => ({ ...world.state }),
    sounds: () => sound.info(),
  }
  await deck.mount()
}

/** The mouse pointer disappears after 1.5 s without moving, so it never sits on the projected picture. */
function hideIdleCursor(): void {
  let timer = 0
  const wake = () => {
    document.body.classList.remove('cursor-hidden')
    window.clearTimeout(timer)
    timer = window.setTimeout(() => document.body.classList.add('cursor-hidden'), 1500)
  }
  window.addEventListener('mousemove', wake)
  wake()
}

start(root).catch((err: unknown) => {
  console.error(err)
  root.textContent = String(err)
})
