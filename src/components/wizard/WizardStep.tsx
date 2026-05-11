// Eine einzelne Wizard-Frage: großer Text, Antwort-Karten.
// Supportet verschiedene Typen: card-grid (normal), stepper (Zahl), binary (2 Optionen groß).

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { Minus, Plus, Check } from 'lucide-react'
import type { WizardFrage } from '@/lib/types'

interface WizardStepProps {
  frage: WizardFrage
  value: unknown
  onChange: (v: unknown) => void
}

export function WizardStep({ frage, value, onChange }: WizardStepProps) {
  return (
    <motion.div
      key={frage.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-3xl mx-auto w-full"
    >
      <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-ink leading-tight">
        {frage.text}
      </h2>
      {frage.hint && (
        <p className="mt-3 text-sm text-muted leading-relaxed">{frage.hint}</p>
      )}

      <div className="mt-10">
        {frage.type === 'card-grid' && <CardGrid frage={frage} value={value} onChange={onChange} />}
        {frage.type === 'binary' && <BinaryGrid frage={frage} value={value} onChange={onChange} />}
        {frage.type === 'stepper' && <Stepper value={value as number | undefined} onChange={onChange} />}
      </div>
    </motion.div>
  )
}

function CardGrid({ frage, value, onChange }: WizardStepProps) {
  const cols =
    (frage.optionen?.length ?? 0) > 8
      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      : (frage.optionen?.length ?? 0) > 4
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2'
  return (
    <div className={cn('grid gap-2', cols)}>
      {frage.optionen?.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'group text-left p-4 rounded-card transition-all duration-200',
              'border-[0.5px]',
              selected
                ? 'border-ink bg-paper-soft shadow-soft'
                : 'border-line bg-paper hover:border-line-strong hover:bg-paper-soft'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div
                  className={cn(
                    'text-sm font-medium transition-colors',
                    selected ? 'text-ink' : 'text-ink'
                  )}
                >
                  {opt.label}
                </div>
                {opt.description && (
                  <div className="text-xxs text-muted mt-1 leading-relaxed">
                    {opt.description}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  'w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all',
                  selected ? 'bg-ink text-paper' : 'bg-transparent border-[0.5px] border-line-strong'
                )}
              >
                {selected && <Check size={10} strokeWidth={3} />}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function BinaryGrid({ frage, value, onChange }: WizardStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {frage.optionen?.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'p-6 rounded-card transition-all duration-200 text-center',
              'border-[0.5px]',
              selected
                ? 'border-ink bg-paper-soft shadow-soft'
                : 'border-line bg-paper hover:border-line-strong hover:bg-paper-soft'
            )}
          >
            <div className="text-base font-medium text-ink">{opt.label}</div>
            {opt.description && (
              <div className="text-xxs text-muted mt-1">{opt.description}</div>
            )}
          </button>
        )
      })}
    </div>
  )
}

function Stepper({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (v: unknown) => void
}) {
  const current = typeof value === 'number' ? value : 3
  const dec = () => onChange(Math.max(1, current - 1))
  const inc = () => onChange(Math.min(30, current + 1))
  return (
    <div className="flex items-center gap-4 justify-center">
      <button
        onClick={dec}
        className="w-12 h-12 rounded-full border-[0.5px] border-line bg-paper hover:bg-paper-soft hover:border-line-strong flex items-center justify-center transition-colors"
      >
        <Minus size={18} />
      </button>
      <div className="min-w-[120px] text-center">
        <div className="text-5xl font-medium tracking-tight tabular-nums">{current}</div>
        <div className="text-xxs text-muted mt-1 font-mono uppercase tracking-widest">
          {current === 1 ? 'Geschoss' : 'Geschosse'}
        </div>
      </div>
      <button
        onClick={inc}
        className="w-12 h-12 rounded-full border-[0.5px] border-line bg-paper hover:bg-paper-soft hover:border-line-strong flex items-center justify-center transition-colors"
      >
        <Plus size={18} />
      </button>
    </div>
  )
}
