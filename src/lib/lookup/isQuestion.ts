// Heuristik: erkennt, ob ein Eingabe-String eine Frage oder ein Stichwort ist.
// Wird sowohl im Live-Hint im Composer („↩ Frage" / „↩ Suche") verwendet als
// auch beim Submit, um Chat-Stream vs. Akkordeon-Filter zu entscheiden.

export type EingabeArt = 'frage' | 'stichwort'

const FRAGEWOERTER =
  /^(wie|was|wann|wo|woher|wohin|warum|weshalb|wer|wen|wem|welche|welcher|welches|kann|darf|muss|müssen|brauche|brauchen|ist|sind|gibt|hat|haben|soll|sollte|wäre|gilt|zählt)\s/i

export function isQuestion(text: string): EingabeArt | null {
  const t = text.trim()
  if (!t) return null
  if (t.endsWith('?')) return 'frage'
  if (FRAGEWOERTER.test(t)) return 'frage'
  if (t.split(/\s+/).length > 3) return 'frage'
  return 'stichwort'
}
