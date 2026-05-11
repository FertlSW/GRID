// Gemeinsamer Rahmen für alle Seiten: Logo oben, Content in der Mitte, Footer unten.
// Standard-Layout ist Page-Scroll (min-h-screen). Mit `appLayout=true` wird die
// Shell zu einem fixed-height-App-Layout (h-screen overflow-hidden), in dem
// der Inhaltsbereich intern scrollt — gedacht für die Ergebnisseite.

import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface ShellProps {
  children: ReactNode
  /** Wenn true, wird das Logo nicht als Link gezeigt (z.B. auf der Landing selbst) */
  minimal?: boolean
  /** Optionaler Header-Rechts-Slot */
  headerRight?: ReactNode
  /** Optionaler Slot direkt rechts neben dem Logo (z.B. ProjektMenu). */
  headerProject?: ReactNode
  /** Wenn true: h-screen-Layout, main hat overflow-hidden — der Content
   *  managed sein Scrolling selbst. */
  appLayout?: boolean
}

export function Shell({ children, minimal = false, headerRight, headerProject, appLayout = false }: ShellProps) {
  return (
    <div
      className={cn(
        'flex flex-col bg-paper',
        appLayout ? 'h-screen overflow-hidden' : 'min-h-screen',
      )}
    >
      <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-line-soft shrink-0">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {minimal ? (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="font-medium text-[15px] tracking-tight"
              >
                Grid<span className="text-muted">.legal</span>
              </motion.span>
            ) : (
              <Link
                to="/"
                className="font-medium text-[15px] tracking-tight hover:opacity-70 transition-opacity"
              >
                Grid<span className="text-muted">.legal</span>
              </Link>
            )}
            {headerProject}
          </div>
          <div className="flex items-center gap-3">{headerRight}</div>
        </div>
      </header>

      <main
        className={cn(
          'w-full',
          appLayout ? 'flex-1 min-h-0 overflow-hidden' : 'flex-1',
        )}
      >
        {children}
      </main>
    </div>
  )
}
