// Kennzahl-Kachel — große Zahl, kleine Beschreibung.

interface MetricCardProps {
  label: string
  value: string
  hint?: string
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="bg-paper-soft rounded-card px-4 py-3 border-[0.5px] border-line-soft">
      <div className="text-xxs text-muted leading-tight">{label}</div>
      <div className="text-lg font-medium text-ink mt-0.5 tabular-nums tracking-tight leading-tight">
        {value}
      </div>
      {hint && <div className="text-xxs text-muted-soft mt-1 leading-tight">{hint}</div>}
    </div>
  )
}
