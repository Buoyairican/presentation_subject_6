import { defineSlide, type SlideDefinition } from '@deck/kit'
import { gsap } from 'gsap'
import type { Scene } from '../content/scenes'
import { el, maskedWords } from '../src/dom'
import { world } from '../src/world/world'
import { fadeUp, howFrom, rise } from './common'

/**
 * Seconds the question stays on screen before the professional starts by itself. A click moves on sooner, so the
 * Narrator never has to press here (she can, if she reads the question aloud and wants to go on).
 */
export const QUESTION_HOLD = 7

/**
 * The question of the freeze, between the Narrator's last words and the professional's answer: the topic, the
 * question in large type, and a thin line that fills while the screen waits, so nobody wonders whether to click.
 */
export function questionSlide(scene: Scene): SlideDefinition {
  let timer: HTMLElement
  let timerBox: HTMLElement
  const state = { mode: 'media' as const, scene: scene.n, filled: scene.n - 1 }

  return defineSlide({
    id: `scene-${scene.n}-question`,
    claim: `Scene ${scene.n}, the question: ${scene.question.text}`,
    notes: `Scene ${scene.n} · the question. It stays ${QUESTION_HOLD} s, then the professional starts by itself (a click starts it sooner). No press needed.`,
    transition: 'fade',
    tempo: 'slow',
    build({ stage, tl }) {
      const mark = el('div', 'qs-mark', stage)
      mark.textContent = '?'
      const box = el('div', 'center-stack qs', stage)
      const topic = el('div', 'qs-topic', box)
      el('span', 'qs-num', topic).textContent = String(scene.n)
      el('span', 'qs-topic-text', topic).textContent = scene.question.topic
      const text = el('div', 'qs-text', box)
      const words = maskedWords(text, scene.question.text)
      timerBox = el('div', 'qs-timer', box)
      timer = el('i', '', timerBox)

      tl.fromTo(mark, { opacity: 0, y: 40, rotate: -6 }, { opacity: 1, y: 0, rotate: 0, duration: 1.8, ease: 'expo.out' }, 0)
      tl.fromTo(topic, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, 0.15)
      rise(tl, words, 0.3, { duration: 1.2, stagger: 0.06 })
      fadeUp(tl, timerBox, 0.9, 6, 0.8)
      tl.addLabel('step-0')
    },
    enter({ direction, signal, advance }) {
      world.go(state, howFrom(direction))
      gsap.killTweensOf(timer)
      if (direction !== 'forward') {
        // Coming back from the professional (or a jump): the question waits for a click.
        gsap.set(timer, { scaleX: 0 })
        gsap.set(timerBox, { opacity: 0 })
        return
      }
      gsap.set(timerBox, { clearProps: 'opacity' })
      const fill = gsap.fromTo(timer, { scaleX: 0 }, { scaleX: 1, duration: QUESTION_HOLD, ease: 'none', onComplete: advance })
      signal.addEventListener('abort', () => fill.kill(), { once: true })
    },
  })
}
