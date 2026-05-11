// Schlanke Tabellen-Darstellung für ChatBlockTabelle.

import type { ChatBlockTabelle } from '@/lib/llm/chatTypes'

interface ChatTabelleProps {
  block: ChatBlockTabelle
}

export function ChatTabelle({ block }: ChatTabelleProps) {
  return (
    <div className="overflow-x-auto rounded-card border-[0.5px] border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-paper-muted">
            {block.spalten.map((s, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 text-xxs font-mono uppercase tracking-widest text-muted font-medium"
              >
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.zeilen.map((zeile, i) => (
            <tr
              key={i}
              className="border-t-[0.5px] border-line-soft last:border-b-0"
            >
              {zeile.map((zelle, j) => (
                <td
                  key={j}
                  className="px-3 py-2 text-ink leading-relaxed align-top"
                >
                  {zelle}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
