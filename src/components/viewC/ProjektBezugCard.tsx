// „Bezug zum Projekt"-Card im Chat-Antwort-Layout.
// Visuell: weiße Card mit Border, accent-Punkt + uppercase Label, Markdown-Text.

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ProjektBezugCardProps {
  text: string
}

export function ProjektBezugCard({ text }: ProjektBezugCardProps) {
  return (
    <div className="rounded-card border-[0.5px] border-line bg-paper px-5 py-[18px]">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
          Bezug zum Projekt
        </span>
      </div>
      <div className="text-[13.5px] leading-[1.6] text-ink-soft">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="m-0 [&:not(:first-child)]:mt-2">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-medium text-ink">{children}</strong>
            ),
            em: ({ children }) => <em className="italic text-ink">{children}</em>,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  )
}
