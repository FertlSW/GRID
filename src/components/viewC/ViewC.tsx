// Chat-Ansicht (View C).
// Hauptbereich: Messages scrollen intern, Composer fix am unteren Rand.
// Empty-State: zentriertes Eingabefeld in der Mitte.

import { useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/viewC/ChatMessage'
import { ChatInput } from '@/components/viewC/ChatInput'
import { ChatSidebar } from '@/components/viewC/ChatSidebar'
import { MotionReveal } from '@/components/shared/MotionReveal'
import { useChat } from '@/hooks/useChat'

interface ViewCProps {
  withSidebar?: boolean
}

export function ViewC({ withSidebar = false }: ViewCProps) {
  const { nachrichten, sende, abbrechen, loading } = useChat()

  const leer = nachrichten.length === 0

  // Auto-Scroll ans Ende, sobald sich die Nachrichtenliste ändert.
  const endeRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    endeRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [nachrichten])

  const main = (
    <section className="h-full flex flex-col min-h-0">
      {leer ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            <MotionReveal>
              <ChatInput onSend={sende} onStop={abbrechen} loading={loading} />
            </MotionReveal>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 py-8 flex flex-col gap-8">
              {nachrichten.map((n) => (
                <ChatMessage key={n.id} nachricht={n} />
              ))}
              <div ref={endeRef} />
            </div>
          </div>
          <div className="shrink-0 bg-paper">
            <div className="mx-auto max-w-3xl px-6 py-4">
              <ChatInput onSend={sende} onStop={abbrechen} loading={loading} />
            </div>
          </div>
        </>
      )}
    </section>
  )

  if (!withSidebar) return main

  return (
    <div className="h-full min-h-0 flex">
      <ChatSidebar className="hidden md:flex" />
      <div className="flex-1 min-w-0">{main}</div>
    </div>
  )
}
