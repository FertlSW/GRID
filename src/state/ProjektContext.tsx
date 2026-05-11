// Backward-Compat-Shim: leitet auf den neuen Multi-Projekt-Provider um.
// Konsumenten, die heute `useProjekt()` aufrufen, bekommen weiter `params` und
// `setParam` — angedockt an das aktuell aktive Projekt.

import { useMemo } from 'react'
import { ProjekteProvider, useProjekte } from '@/state/ProjekteContext'
import type { ReactNode } from 'react'
import type { ProjektParameter } from '@/lib/types'

export function ProjektProvider({ children }: { children: ReactNode }) {
  return <ProjekteProvider>{children}</ProjekteProvider>
}

interface UseProjektResult {
  params: ProjektParameter
  setParam: (key: keyof ProjektParameter, value: unknown) => void
  reset: () => void
}

export function useProjekt(): UseProjektResult {
  const { params, setParam, legeNeuesProjektAn } = useProjekte()
  return useMemo(
    () => ({
      params,
      setParam,
      // `reset()` ist ein Legacy-Begriff aus der alten Single-Projekt-Welt.
      // Im Multi-Projekt-Modell heißt das semantisch: ein neues Projekt anlegen.
      reset: () => {
        legeNeuesProjektAn()
      },
    }),
    [params, setParam, legeNeuesProjektAn],
  )
}
