// Inkrementeller JSON-Parser für den Streaming-Chat.
//
// Das Modell streamt JSON in der Form
//   { "topic": "...", "projektBezug": "...", "bloecke": [ {...}, {...} ], "rueckfrage": "..." }
// Diese Klasse akkumuliert die Chunks und erkennt, sobald
//   - ein neues Block-Objekt komplett zu Ende geschrieben wurde,
//   - der `rueckfrage`-String komplett vorliegt,
//   - der `topic`-String komplett vorliegt,
//   - der `projektBezug`-String komplett vorliegt.
// Alle erkannten Felder werden sofort gemeldet — die UI kann fertige Teile
// rendern, während der Stream weiterläuft.
//
// Der Parser ist stringbewusst: `{`/`}`/`[`/`]` innerhalb von JSON-Strings
// werden ignoriert, ebenso ein per Backslash escapetes Anführungszeichen.

import type { ChatBlock, ChatTopic } from '@/lib/llm/chatTypes'

export interface StreamParserOutput {
  /** Neu fertig gewordene Blöcke seit dem letzten `feed()`. */
  neueBloecke: ChatBlock[]
  /** Wenn `rueckfrage` jetzt erstmals komplett vorliegt. */
  rueckfrage?: string
  /** Wenn `topic` jetzt erstmals komplett vorliegt. */
  topic?: ChatTopic
  /** Wenn `projektBezug` jetzt erstmals komplett vorliegt. */
  projektBezug?: string
}

const ERLAUBTE_TOPICS: ReadonlySet<string> = new Set([
  'fluchtwege',
  'hoehe',
  'uwert',
])

export class ChatStreamParser {
  private buffer = ''
  private emittedBlockCount = 0
  private rueckfrageEmitted = false
  private topicEmitted = false
  private projektBezugEmitted = false

  feed(chunk: string): StreamParserOutput {
    this.buffer += chunk
    const out: StreamParserOutput = { neueBloecke: [] }

    const alleBloecke = this.extractCompleteBlocks()
    if (alleBloecke.length > this.emittedBlockCount) {
      out.neueBloecke = alleBloecke.slice(this.emittedBlockCount)
      this.emittedBlockCount = alleBloecke.length
    }

    if (!this.rueckfrageEmitted) {
      const rf = this.extractStringField('rueckfrage')
      if (rf !== null) {
        out.rueckfrage = rf
        this.rueckfrageEmitted = true
      }
    }

    if (!this.topicEmitted) {
      const t = this.extractStringField('topic')
      if (t !== null && ERLAUBTE_TOPICS.has(t)) {
        out.topic = t as ChatTopic
        this.topicEmitted = true
      } else if (t !== null) {
        // Unzulässiger Wert → einmal als „verarbeitet" markieren, damit wir
        // nicht in jeder feed()-Runde den gleichen ungültigen String prüfen.
        this.topicEmitted = true
      }
    }

    if (!this.projektBezugEmitted) {
      const pb = this.extractStringField('projektBezug')
      if (pb !== null) {
        out.projektBezug = pb
        this.projektBezugEmitted = true
      }
    }

    return out
  }

  /** Finalisiert. Nach `done()` darf `feed()` nicht mehr aufgerufen werden. */
  done(): StreamParserOutput {
    return this.feed('')
  }

  // ──────────────────────────── intern ────────────────────────────

  private extractCompleteBlocks(): ChatBlock[] {
    const start = this.findArrayStart('bloecke')
    if (start < 0) return []

    const result: ChatBlock[] = []
    let i = start + 1 // hinter '['

    while (i < this.buffer.length) {
      // führende Whitespace + Kommata überspringen
      while (i < this.buffer.length && /[\s,]/.test(this.buffer[i])) i++
      if (i >= this.buffer.length) break
      if (this.buffer[i] === ']') break
      if (this.buffer[i] !== '{') break

      const end = this.findMatchingBrace(i)
      if (end < 0) break // Block nicht fertig

      const slice = this.buffer.slice(i, end + 1)
      try {
        const parsed = JSON.parse(slice) as unknown
        if (this.istValiderBlock(parsed)) {
          result.push(parsed as ChatBlock)
        }
      } catch {
        // Block nicht parsbar → ignorieren, beim nächsten feed() klappt's vielleicht
      }

      i = end + 1
    }

    return result
  }

  /** Liest einen Top-Level-String-Wert (z.B. `"rueckfrage"`, `"topic"`). */
  private extractStringField(key: string): string | null {
    const needle = `"${key}"`
    const k = this.buffer.indexOf(needle)
    if (k < 0) return null

    // Nach dem Key kommt `:` und dann ein String.
    let i = k + needle.length
    while (i < this.buffer.length && this.buffer[i] !== ':') i++
    if (i >= this.buffer.length) return null
    i++ // hinter ':'
    while (i < this.buffer.length && /\s/.test(this.buffer[i])) i++
    if (i >= this.buffer.length) return null
    if (this.buffer[i] !== '"') return null

    const start = i
    const end = this.findStringEnd(i)
    if (end < 0) return null

    try {
      return JSON.parse(this.buffer.slice(start, end + 1)) as string
    } catch {
      return null
    }
  }

  /** Sucht den Index direkt nach `"<key>":` `[`. Gibt Index von `[` zurück. */
  private findArrayStart(key: string): number {
    const needle = `"${key}"`
    const k = this.buffer.indexOf(needle)
    if (k < 0) return -1
    let i = k + needle.length
    while (i < this.buffer.length && this.buffer[i] !== ':') i++
    i++
    while (i < this.buffer.length && /\s/.test(this.buffer[i])) i++
    if (i >= this.buffer.length) return -1
    if (this.buffer[i] !== '[') return -1
    return i
  }

  /** Findet zur öffnenden `{` an Position `start` die zugehörige `}`.
   *  Stringbewusst, escape-bewusst. Gibt -1 zurück, wenn noch nicht zu Ende. */
  private findMatchingBrace(start: number): number {
    let depth = 0
    let inString = false
    let escape = false
    for (let i = start; i < this.buffer.length; i++) {
      const c = this.buffer[i]
      if (escape) {
        escape = false
        continue
      }
      if (c === '\\') {
        escape = true
        continue
      }
      if (c === '"') {
        inString = !inString
        continue
      }
      if (inString) continue
      if (c === '{') depth++
      else if (c === '}') {
        depth--
        if (depth === 0) return i
      }
    }
    return -1
  }

  /** Findet das schließende `"` zu einem String, der bei `start` beginnt. */
  private findStringEnd(start: number): number {
    let escape = false
    for (let i = start + 1; i < this.buffer.length; i++) {
      const c = this.buffer[i]
      if (escape) {
        escape = false
        continue
      }
      if (c === '\\') {
        escape = true
        continue
      }
      if (c === '"') return i
    }
    return -1
  }

  /** Sehr leichte Strukturprüfung — vor dem Rendern.
   *  Vollvalidierung passiert nicht hier, das macht der Renderer-Switch. */
  private istValiderBlock(x: unknown): boolean {
    if (!x || typeof x !== 'object') return false
    const obj = x as Record<string, unknown>
    return typeof obj.typ === 'string'
  }
}
