// Dünner Adapter für OIB-Richtlinie 2 — Tabelle 1a (Brandverhalten).
// Nur Import + Re-Export — gesamte Logik liegt in src/lib/rules/.

import oibRl2Tab1aJson from '@/data/gesetzestexte/oib-rl-2-tab1a.json'
import type { GesetzestextDatei } from '@/lib/rules/schema'

export const oibRl2Tab1a = oibRl2Tab1aJson as unknown as GesetzestextDatei
