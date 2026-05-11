// Formatiert die kebab-case-Slugs aus dem Feld `thema` in lesbare Labels.
// Beispiel: "brandverhalten-fassade-wdvs" → "Brandverhalten · Fassade WDVS".
// Das erste Segment wird als Oberthema interpretiert und durch "·" vom Rest getrennt.

const ACRONYMS = new Set(['WDVS', 'BROOF', 'OIB', 'HWB', 'PEB'])

export function formatThemaLabel(slug: string | undefined | null): string {
  if (!slug) return ''
  const parts = slug.split('-').map((w) => {
    const upper = w.toUpperCase()
    if (ACRONYMS.has(upper)) return upper
    return w.charAt(0).toUpperCase() + w.slice(1)
  })
  if (parts.length <= 1) return parts.join(' ')
  return `${parts[0]} · ${parts.slice(1).join(' ')}`
}
