// View B: Das Architekten-Dashboard mit Phasen-Selector + 9 räumlichen Kategorien.

import { useMemo, useState } from 'react'
import { viewBKategorien } from '@/data/categoriesViewB'
import { phasen } from '@/data/phases'
import type { Phase } from '@/lib/types'
import { useProjekt } from '@/state/ProjektContext'
import {
  filterRegeln,
  regelnFuerPhase,
  regelnFuerViewBKategorie,
} from '@/lib/filter'
import { PhaseSelector } from '@/components/viewB/PhaseSelector'
import { ScaleCategory } from '@/components/viewB/ScaleCategory'
import { MotionReveal } from '@/components/shared/MotionReveal'

export function ViewB() {
  const { params } = useProjekt()
  const [phase, setPhase] = useState<Phase>('vorentwurf')

  const alle = useMemo(() => filterRegeln(params), [params])
  const phasenRegeln = useMemo(() => regelnFuerPhase(alle, phase), [alle, phase])

  const phaseInfo = phasen.find((p) => p.id === phase)!

  return (
    <div>
      <MotionReveal>
        <div className="flex justify-center mb-10">
          <PhaseSelector value={phase} onChange={setPhase} />
        </div>
      </MotionReveal>

      <div>
        {viewBKategorien.map((k) => (
          <ScaleCategory
            key={k.id}
            kategorie={k}
            regeln={regelnFuerViewBKategorie(phasenRegeln, k.id)}
          />
        ))}
      </div>

      <div className="border-t-[0.5px] border-line pt-4 mt-8 flex items-center justify-between text-xxs text-muted">
        <span>
          Phase „{phaseInfo.label}" · {phasenRegeln.length} relevante Punkte
        </span>
        {phase !== 'ausfuehrung' && (
          <button
            onClick={() => {
              const order: Phase[] = ['vorentwurf', 'entwurf', 'genehmigung', 'ausfuehrung']
              setPhase(order[order.indexOf(phase) + 1])
            }}
            className="text-ink hover:underline"
          >
            Weiter zur nächsten Phase →
          </button>
        )}
      </div>
    </div>
  )
}
