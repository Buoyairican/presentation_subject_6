/**
 * The Narrator's press sheet, for the clipboard: every press of the show on the Narrator's own words.
 * Writes press-sheet.html and, with Playwright installed, ../../PRESS-SHEET.pdf (A4).
 *   node tools/press-sheet/make.ts
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { narratorCues, scenes } from '../../app/content/scenes.ts'

const here = fileURLToPath(new URL('.', import.meta.url))
const fonts = '../../app/node_modules'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** How long the clip of a scene lasts (m:ss), read from app/public/media/scene-<n>-*.webm with ffprobe; '' if unknown. */
function clipLength(scene: number): string {
  try {
    const dir = `${here}../../app/public/media/`
    const file = readdirSync(dir).find((f) => f.startsWith(`scene-${scene}-`) && f.endsWith('.webm'))
    if (!file) return ''
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dir + file]).toString()
    const sec = Math.round(Number(out))
    return Number.isFinite(sec) ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : ''
  } catch {
    return ''
  }
}

let n = 0
const press = (when: string, words: string, after = '') => `
  <div class="row">
    <div class="num">${++n}</div>
    <div class="body">
      <div class="when">${when}</div>
      <div class="words">▶ ${words}</div>
      ${after ? `<div class="after">${after}</div>` : ''}
    </div>
  </div>`

const before = `
  <section class="block first">
    <h3><span>Before</span> Set-up</h3>
    ${press('Before the audience comes in, on the black screen:', 'Click once', 'You hear a soft whoosh = the sound works. The title appears and stays during the prologue.')}
  </section>
  <section class="block">
    <h3><span>Prologue</span> Good morning, everyone…</h3>
    ${press('At the end of your sentence:', `<b>“…${esc(narratorCues.prologueEnd.replace(/^Maybe /, ''))}”</b>`, '“Candidate 1 — Ayoub” for a few seconds, then Scene 1 in the corner.')}
  </section>`

const sceneBlocks = scenes
  .map((s) => {
    const before = s.narrator.slice(0, s.narrator.length - s.videoCue.length).trim()
    return `
  <section class="scene">
    <h3><span>Scene ${s.n}</span> ${esc(s.title)}</h3>
    ${press('Hand up, and on the word:', '<b>“Freeze!”</b>', 'Blue screen + freeze sound. Everyone stops.')}
    ${press(`Say: <i>“${esc(before)}</i>`, `<b>“${esc(s.videoCue)}”</b>`, `The question “${esc(s.question.text)}” shows for 7 s, then the professional starts by itself (no click needed)${clipLength(s.n) ? `: the clip lasts <b>${clipLength(s.n)}</b>, everyone stays frozen` : ''}. During the clip clicks are ignored. When the soft whoosh starts, lower your hand. Actors start again when it fades.`)}
  </section>`
  })
  .join('')

const after = `
  <section class="block warm">
    <h3><span>Part 2</span> Candidate 2 — Aya</h3>
    ${press('After the last clip, when the room is back, say:', `<b>“${esc(narratorCues.part2)}”</b>`, 'Morning light. Then say “No freezes this time. No videos. Just watch.” No more clicks until the very end.')}
  </section>
  <section class="block">
    <h3><span>Finale</span> Your last words</h3>
    ${press('“Two candidates. The same jury. Two very different results.', `<b>“${esc(narratorCues.finale)}”</b>`, '“Who is really being interviewed?” stays up for the bow.')}
    ${press('After the bow:', 'Click', '“Keep practising”: the accounts and websites with their QR codes. Leave it up while people scan.')}
    ${press('When people have scanned:', 'Click', 'The credits. The end.')}
  </section>`

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Press sheet</title>
<style>
@font-face { font-family: 'Inter'; src: url('${fonts}/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2') format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Serif'; src: url('${fonts}/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2') format('woff2'); font-style: italic; }
@page { size: A4; margin: 14mm 14mm 14mm 14mm; }
* { box-sizing: border-box; }
body { margin: 0; font: 400 10.5pt/1.38 Inter, sans-serif; color: #111827; }
h1 { font: italic 400 30pt/1 Serif, serif; margin: 0 0 4pt; letter-spacing: -0.01em; }
.lead { font-size: 10.5pt; color: #374151; margin: 0 0 10pt; }
.lead b { color: #111827; }
.cols { columns: 2; column-gap: 9mm; }
.scene, .block { break-inside: avoid; margin: 0 0 7pt; padding: 7pt 9pt 3pt; border: 1px solid #e5e7eb; border-radius: 7pt; }
.block.first { background: #f8fafc; }
h3 { margin: 0 0 4pt; font: 600 10.5pt/1.2 Inter; }
h3 span { display: inline-block; font: 700 7.5pt/1 Inter; letter-spacing: 0.12em; text-transform: uppercase; color: #fff; background: #1f5bff; padding: 3pt 5pt; border-radius: 3pt; margin-right: 4pt; vertical-align: 1pt; }
.row { display: flex; gap: 7pt; margin: 0 0 5pt; }
.num { flex: none; width: 17pt; height: 17pt; border-radius: 50%; background: #111827; color: #fff; font: 700 8.5pt/17pt Inter; text-align: center; margin-top: 1pt; }
.when { color: #4b5563; font-size: 9.5pt; }
.when i { color: #111827; }
.words { font-size: 12pt; font-weight: 600; }
.words b { color: #1f5bff; }
.after { color: #6b7280; font-size: 8.5pt; }
.warm h3 span { background: #e8892f; }
.help { break-inside: avoid; margin-top: 4pt; padding: 8pt 10pt; border-radius: 7pt; background: #111827; color: #e5e7eb; font-size: 9pt; }
.help b { color: #fff; }
.help p { margin: 0 0 3pt; }
</style></head><body>
<h1>The Perfect Candidate · Narrator</h1>
<p class="lead"><b>Click only on your own words.</b> 20 clicks in the whole play. ▶ = <b>left click</b> of the mouse; <b>right click</b> = back.
If you are early or late by a second, nothing breaks.</p>
<div class="cols">
  ${before}
  ${sceneBlocks}
  ${after}
  <div class="help">
    <p><b>Right click = undo.</b> Clicked “Freeze!” too early? Right click: the room comes back to life. Right click during a clip stops it.</p>
    <p><b>Double click?</b> During a clip, clicks are ignored. Elsewhere, a second click within ¾ s counts once.</p>
    <p><b>A clip does not play?</b> The show goes on by itself after a few seconds.</p>
    <p>The pointer hides by itself. Keyboard: <b>S</b> skip the clip · <b>B</b> black screen · <b>F</b> full screen · <b>H</b> help.</p>
  </div>
</div>
</body></html>`

writeFileSync(`${here}press-sheet.html`, html)
console.log('press-sheet.html written')

try {
  const require = createRequire(import.meta.url)
  const { chromium } = require('playwright')
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(`file://${here}press-sheet.html`)
  await page.evaluate(() => document.fonts.ready)
  await page.pdf({ path: `${here}../../PRESS-SHEET.pdf`, format: 'A4', printBackground: true, preferCSSPageSize: true })
  await browser.close()
  console.log('PRESS-SHEET.pdf written')
} catch (err) {
  console.log('Playwright not available: open press-sheet.html in a browser and print it to PDF.', String(err))
}
