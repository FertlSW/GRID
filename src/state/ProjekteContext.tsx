// Multi-Projekt-Provider.
// Hält eine Liste von Projekten + das aktive Projekt, persistiert sie im
// localStorage und stellt eine zu `useProjekt()` shape-kompatible API bereit
// (`params`, `setParam`), damit alle bestehenden Konsumenten unverändert
// bleiben.
//
// Beim ersten Laden ohne gespeicherten State legt der Provider automatisch
// ein „Beispielprojekt" mit den klassischen Default-Parametern an, damit der
// Erstnutzer sofort etwas Sinnvolles auf der Ergebnisseite sieht.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ProjektParameter } from '@/lib/types'
import {
  lade,
  speichere,
  neueProjektId,
  type Projekt,
  type ProjekteState,
} from '@/lib/projekt/projekteStorage'

// Default-Werte für das initiale Beispielprojekt.
// Bewusst nicht für „+ Neues Projekt" — das soll wirklich leer starten.
export const beispielParams: ProjektParameter = {
  hauptnutzung: 'wohnen',
  widmung: 'wohngebiet',
  bauklasse: 'BK_IV',
  gebaeudeklasse: 'GK4',
  bauweise: 'offen_oder_gekuppelt',
  oberirdischeGeschosse: 5,
  unterirdischeGeschosse: '1',
  fluchtniveau: 'u22',
  grenzabstand: 'u4',
  bauplatz_an_fluchtlinie: 'nein',
  in_schutzzone: 'nein',
  bebauungsplan_abweichend: 'nein',
  bauart: 'neubau',
}

interface ProjekteContextValue {
  projekte: Projekt[]
  aktivesProjekt: Projekt | null
  /** Shortcut auf `aktivesProjekt.params` — leeres Objekt, wenn keins aktiv. */
  params: ProjektParameter
  setParam: (key: keyof ProjektParameter, value: unknown) => void
  legeNeuesProjektAn: () => Projekt
  wechselZuProjekt: (id: string) => void
  benenneProjektUm: (id: string, name: string) => void
  loescheProjekt: (id: string) => void
  markiereAlsKomplett: () => void
}

const ProjekteContext = createContext<ProjekteContextValue | null>(null)

export function ProjekteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProjekteState>(() => {
    const geladen = lade()
    if (geladen.projekte.length > 0) return geladen
    // Erstmaliger Aufruf: Beispielprojekt anlegen.
    const jetzt = Date.now()
    const beispiel: Projekt = {
      id: neueProjektId(jetzt),
      name: 'Beispielprojekt',
      erstelltAm: jetzt,
      zuletztGeoeffnetAm: jetzt,
      params: beispielParams,
      istKomplett: true,
    }
    return { projekte: [beispiel], aktivesProjektId: beispiel.id }
  })

  // Persistenz bei jeder Mutation.
  useEffect(() => {
    const danach = speichere(state)
    if (danach !== state) setState(danach)
  }, [state])

  // ──────────────────────────── Aktionen ────────────────────────────

  const aktivesProjekt = useMemo(
    () =>
      state.projekte.find((p) => p.id === state.aktivesProjektId) ?? null,
    [state],
  )

  const setParam = useCallback(
    (key: keyof ProjektParameter, value: unknown) => {
      setState((prev) => {
        if (!prev.aktivesProjektId) return prev
        return {
          ...prev,
          projekte: prev.projekte.map((p) =>
            p.id === prev.aktivesProjektId
              ? {
                  ...p,
                  zuletztGeoeffnetAm: Date.now(),
                  params: { ...p.params, [key]: value },
                }
              : p,
          ),
        }
      })
    },
    [],
  )

  const legeNeuesProjektAn = useCallback((): Projekt => {
    const jetzt = Date.now()
    let neuesProjekt: Projekt = {
      id: neueProjektId(jetzt),
      name: '',
      erstelltAm: jetzt,
      zuletztGeoeffnetAm: jetzt,
      params: {},
      istKomplett: false,
    }
    setState((prev) => {
      // Nummerierung: nächste freie „Projekt N"-Zahl.
      const namen = new Set(prev.projekte.map((p) => p.name))
      let n = prev.projekte.length + 1
      while (namen.has(`Projekt ${n}`)) n++
      const finalesProjekt = { ...neuesProjekt, name: `Projekt ${n}` }
      neuesProjekt = finalesProjekt
      return {
        projekte: [finalesProjekt, ...prev.projekte],
        aktivesProjektId: finalesProjekt.id,
      }
    })
    return neuesProjekt
  }, [])

  const wechselZuProjekt = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.projekte.some((p) => p.id === id)) return prev
      return {
        ...prev,
        aktivesProjektId: id,
        projekte: prev.projekte.map((p) =>
          p.id === id ? { ...p, zuletztGeoeffnetAm: Date.now() } : p,
        ),
      }
    })
  }, [])

  const benenneProjektUm = useCallback((id: string, name: string) => {
    const sauber = name.trim()
    if (!sauber) return
    setState((prev) => ({
      ...prev,
      projekte: prev.projekte.map((p) =>
        p.id === id ? { ...p, name: sauber } : p,
      ),
    }))
  }, [])

  const loescheProjekt = useCallback((id: string) => {
    setState((prev) => {
      const projekte = prev.projekte.filter((p) => p.id !== id)
      let aktivesProjektId = prev.aktivesProjektId
      if (aktivesProjektId === id) {
        // Auf das zuletzt geöffnete andere Projekt fallback (oder null).
        const naechstes = [...projekte].sort(
          (a, b) => b.zuletztGeoeffnetAm - a.zuletztGeoeffnetAm,
        )[0]
        aktivesProjektId = naechstes?.id ?? null
      }
      return { projekte, aktivesProjektId }
    })
  }, [])

  const markiereAlsKomplett = useCallback(() => {
    setState((prev) => {
      if (!prev.aktivesProjektId) return prev
      return {
        ...prev,
        projekte: prev.projekte.map((p) =>
          p.id === prev.aktivesProjektId ? { ...p, istKomplett: true } : p,
        ),
      }
    })
  }, [])

  // ──────────────────────────── abgeleitete Sicht ────────────────────────────

  const sortierteProjekte = useMemo(
    () =>
      [...state.projekte].sort(
        (a, b) => b.zuletztGeoeffnetAm - a.zuletztGeoeffnetAm,
      ),
    [state.projekte],
  )

  const value: ProjekteContextValue = {
    projekte: sortierteProjekte,
    aktivesProjekt,
    params: aktivesProjekt?.params ?? {},
    setParam,
    legeNeuesProjektAn,
    wechselZuProjekt,
    benenneProjektUm,
    loescheProjekt,
    markiereAlsKomplett,
  }

  return (
    <ProjekteContext.Provider value={value}>{children}</ProjekteContext.Provider>
  )
}

export function useProjekte(): ProjekteContextValue {
  const ctx = useContext(ProjekteContext)
  if (!ctx) {
    throw new Error(
      'useProjekte muss innerhalb eines ProjekteProviders verwendet werden',
    )
  }
  return ctx
}
