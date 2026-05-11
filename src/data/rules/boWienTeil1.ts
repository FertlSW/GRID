// Dünner Adapter für BO Wien Teil I (§§ 1–8, Stadtplanung).
// Nur Import + Re-Export — gesamte Logik liegt in src/lib/rules/.

import boWienTeil1Json from '@/data/gesetzestexte/bo-wien-teil-01.json'
import type { GesetzestextDatei } from '@/lib/rules/schema'

export const boWienTeil1 = boWienTeil1Json as unknown as GesetzestextDatei
