// Der Wizard.
// - Zeigt Fragen nacheinander.
// - Bedingte Fragen werden nur angezeigt, wenn ihre condition-Funktion true zurückgibt.
// - Am Ende: Übersicht + Button "Vorschriften anzeigen".

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Shell } from '@/components/Shell'
import { ProgressBar } from '@/components/wizard/ProgressBar'
import { WizardStep } from '@/components/wizard/WizardStep'
import { ParameterPill } from '@/components/wizard/ParameterPill'
import { wizardFragen } from '@/data/wizardQuestions'
import { useProjekte } from '@/state/ProjekteContext'
import { prefetcheAlleKategorien } from '@/lib/llm/prefetch'

export function WizardPage() {
  const navigate = useNavigate()
  const {
    params,
    setParam,
    aktivesProjekt,
    legeNeuesProjektAn,
    markiereAlsKomplett,
    benenneProjektUm,
  } = useProjekte()
  const [idx, setIdx] = useState(0)
  const [namensEntwurf, setNamensEntwurf] = useState('')

  // Wenn der Wizard ohne aktives Projekt aufgerufen wird (z.B. nach Reload
  // mit leerem localStorage), legen wir eines an — sonst hätten setParam-
  // Aufrufe keinen Empfänger.
  useEffect(() => {
    if (!aktivesProjekt) legeNeuesProjektAn()
  }, [aktivesProjekt, legeNeuesProjektAn])

  // Beim Wechsel des aktiven Projekts den Namens-Entwurf vorbefüllen.
  useEffect(() => {
    if (aktivesProjekt) setNamensEntwurf(aktivesProjekt.name)
  }, [aktivesProjekt?.id])

  // Filtere die aktiven Fragen (bedingte Fragen nur, wenn condition erfüllt).
  const aktiveFragen = useMemo(
    () => wizardFragen.filter((f) => !f.condition || f.condition(params)),
    [params]
  )

  // Schritt 0 = Namensvergabe, danach kommen die Wizard-Fragen.
  const total = aktiveFragen.length + 1
  const istNameSchritt = idx === 0
  const frage = istNameSchritt ? null : aktiveFragen[idx - 1]
  const isLast = idx === total - 1
  const value = frage ? (params as any)[frage.id] : undefined
  const canContinue = istNameSchritt
    ? namensEntwurf.trim().length > 0
    : value !== undefined && value !== null && value !== ''

  const next = () => {
    if (istNameSchritt) {
      if (aktivesProjekt)
        benenneProjektUm(aktivesProjekt.id, namensEntwurf.trim())
      setIdx(1)
      return
    }
    if (isLast) {
      markiereAlsKomplett()
      // Inhalte fürs Dashboard im Hintergrund laden — sobald der User auf
      // /ergebnisse ankommt, läuft der Prefetch bereits. Cache-First-Hooks
      // greifen, sobald die Calls fertig sind. Hash-Vergleich im Prefetch
      // sorgt dafür, dass unveränderte Params keinen erneuten Lauf auslösen.
      if (aktivesProjekt) {
        void prefetcheAlleKategorien(aktivesProjekt.id, params)
      }
      navigate('/ergebnisse')
    } else {
      setIdx((i) => Math.min(total - 1, i + 1))
    }
  }
  const prev = () => setIdx((i) => Math.max(0, i - 1))

  const handleChange = (v: unknown) => {
    if (!frage) return
    setParam(frage.id, v)
  }

  const jumpToIdx = (i: number) => setIdx(i)

  // Label für bereits gegebene Antwort — zeigt lesbar die Auswahl
  const lesbarerWert = (fid: string, val: unknown): string => {
    const f = wizardFragen.find((x) => x.id === fid)
    if (!f) return String(val)
    if (f.type === 'stepper') return `${val}`
    const match = f.optionen?.find((o) => o.value === val)
    return match?.label ?? String(val)
  }

  return (
    <Shell
      headerRight={
        <button
          onClick={() => navigate('/')}
          className="text-xxs text-muted hover:text-ink transition-colors"
        >
          Abbrechen
        </button>
      }
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-10">
        <ProgressBar current={idx} total={total} />

        {/* Bereits gegebene Antworten */}
        <div className="mt-6 flex flex-wrap gap-2 min-h-[28px]">
          <AnimatePresence>
            {aktiveFragen.slice(0, Math.max(0, idx - 1)).map((f, i) => {
              const val = (params as any)[f.id]
              if (val === undefined) return null
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <ParameterPill
                    label={shortLabel(f.id)}
                    value={lesbarerWert(f.id, val)}
                    onClick={() => jumpToIdx(i + 1)}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="mt-16 min-h-[420px]">
          <AnimatePresence mode="wait">
            {istNameSchritt ? (
              <NameSchritt
                key="name"
                value={namensEntwurf}
                onChange={setNamensEntwurf}
                onSubmit={next}
                canContinue={canContinue}
              />
            ) : (
              frage && (
                <WizardStep frage={frage} value={value} onChange={handleChange} />
              )
            )}
          </AnimatePresence>
        </div>

        {/* Navigation unten */}
        <div className="mt-12 flex items-center justify-between max-w-3xl mx-auto w-full">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="group inline-flex items-center gap-2 text-sm text-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={14} />
            Zurück
          </button>
          <button
            onClick={next}
            disabled={!canContinue}
            className="group inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-chip text-sm font-medium hover:bg-ink-soft disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isLast ? 'Vorschriften anzeigen' : 'Weiter'}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0"
            />
          </button>
        </div>
      </div>
    </Shell>
  )
}

// Erster Schritt: Name des Projekts. Eigenes UI, weil Name kein Wizard-Param
// ist, sondern Metadaten — wird über `benenneProjektUm` gespeichert.
function NameSchritt({
  value,
  onChange,
  onSubmit,
  canContinue,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  canContinue: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-3xl mx-auto w-full"
    >
      <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-ink leading-tight">
        Wie soll dein Projekt heißen?
      </h2>
      <p className="mt-3 text-sm text-muted leading-relaxed">
        Ein Name hilft dir, das Projekt später wiederzufinden. Du kannst ihn
        jederzeit ändern.
      </p>
      <div className="mt-10">
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canContinue) onSubmit()
          }}
          placeholder="z.B. Wohnhaus Mariahilfer Straße"
          className="w-full bg-paper border-[0.5px] border-line rounded-chip px-5 py-3 text-base text-ink placeholder:text-muted-soft outline-none focus-visible:outline-none focus:border-line-strong transition-colors"
        />
      </div>
    </motion.div>
  )
}

// Kurze Labels für die Parameter-Pills.
function shortLabel(id: string): string {
  const map: Record<string, string> = {
    hauptnutzung: 'Nutzung',
    gebaeudeklasse: 'GK',
    oberirdischeGeschosse: 'OG',
    unterirdischeGeschosse: 'UG',
    fluchtniveau: 'Flucht',
    grenzabstand: 'Grenze',
    bauart: 'Art',
    anzahlBetten: 'Betten',
    anzahlBewohner: 'Bewohner',
    verkaufsflaeche: 'VF',
    versammlungsflaeche: 'NF',
    sicherheitskategorie: 'K',
  }
  return map[id] ?? id
}
