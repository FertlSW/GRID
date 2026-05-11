// Wenn das Modell statt einer vollen Antwort eine Rückfrage stellt,
// rendern wir hier eine eigene Bubble — visuell abgesetzt von der
// regulären Antwort.

import { HelpCircle } from 'lucide-react'

interface ChatRueckfrageProps {
  text: string
}

export function ChatRueckfrage({ text }: ChatRueckfrageProps) {
  return (
    <div className="flex gap-2.5 items-start bg-accent-soft border-[0.5px] border-accent/20 rounded-card p-3">
      <div className="shrink-0 w-6 h-6 rounded-full bg-accent text-paper flex items-center justify-center">
        <HelpCircle size={13} />
      </div>
      <div>
        <p className="text-xxs font-mono uppercase tracking-widest text-accent mb-1">
          Rückfrage
        </p>
        <p className="text-sm text-ink leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
