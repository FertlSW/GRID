// Kleine Helfer-Funktion, um Tailwind-Klassen bedingt zu kombinieren.
// Ersatz für die clsx-Bibliothek — spart eine Abhängigkeit.

export function cn(
  ...args: Array<string | undefined | null | false | Record<string, boolean | undefined | null>>
): string {
  const parts: string[] = []
  for (const arg of args) {
    if (!arg) continue
    if (typeof arg === 'string') {
      parts.push(arg)
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) parts.push(key)
      }
    }
  }
  return parts.join(' ')
}
