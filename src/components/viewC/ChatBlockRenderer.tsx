// Render-Switch für die sechs Block-Typen einer Chat-Antwort.
//
// Blöcke ohne Provenance: ueberschrift, hinweis.
// Blöcke mit Provenance:  prosa, tabelle, liste, kennzahl.
// Klick auf den Provenance-Marker öffnet ein Popover mit Quellen-Details.

import { useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Info, AlertTriangle } from 'lucide-react'
import type {
  ChatBlock,
  ChatBlockUeberschrift,
  ChatBlockHinweis,
} from '@/lib/llm/chatTypes'
import { ProvenanceBadge } from '@/components/viewC/ProvenanceBadge'
import { QuellenPopover } from '@/components/viewC/QuellenPopover'
import { ChatTabelle } from '@/components/viewC/ChatTabelle'
import { cn } from '@/lib/cn'

interface ChatBlockRendererProps {
  block: ChatBlock
}

export function ChatBlockRenderer({ block }: ChatBlockRendererProps) {
  // Provenance-lose Blöcke: eigene Render-Pfade, kein Marker.
  if (block.typ === 'ueberschrift') return <UeberschriftRender block={block} />
  if (block.typ === 'hinweis') return <HinweisRender block={block} />

  return <ProvenanceBlockRender block={block} />
}

// ──────────────────────────── ueberschrift / hinweis ────────────────────────────

function UeberschriftRender({ block }: { block: ChatBlockUeberschrift }) {
  if (block.ebene === 'haupt') {
    return (
      <h3 className="text-sm font-medium text-ink mt-2 mb-0.5">
        {block.text}
      </h3>
    )
  }
  return (
    <h4 className="text-xxs font-mono uppercase tracking-widest text-muted mt-1">
      {block.text}
    </h4>
  )
}

function HinweisRender({ block }: { block: ChatBlockHinweis }) {
  const Icon = block.ton === 'warnung' ? AlertTriangle : Info
  const farbe =
    block.ton === 'warnung'
      ? 'bg-state-depBg text-state-dep border-state-dep/20'
      : 'bg-paper-muted text-muted border-line'
  return (
    <div
      className={cn(
        'flex gap-2 items-start border-[0.5px] rounded-card p-3 text-xs leading-relaxed',
        farbe,
      )}
    >
      <Icon size={14} className="shrink-0 mt-0.5" />
      <p>{block.text}</p>
    </div>
  )
}

// ──────────────────────────── prosa / tabelle / liste / kennzahl ────────────────────────────

function ProvenanceBlockRender({
  block,
}: {
  block: Exclude<ChatBlock, ChatBlockUeberschrift | ChatBlockHinweis>
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <Inhalt block={block} />
      <div>
        <ProvenanceBadge
          provenance={block.provenance}
          open={open}
          onClick={() => setOpen((o) => !o)}
        />
        <QuellenPopover provenance={block.provenance} visible={open} />
      </div>
    </div>
  )
}

function Inhalt({
  block,
}: {
  block: Exclude<ChatBlock, ChatBlockUeberschrift | ChatBlockHinweis>
}) {
  switch (block.typ) {
    case 'prosa':
      return (
        <div className="text-sm text-ink leading-relaxed max-w-none">
          <MdInline>{block.markdown}</MdInline>
        </div>
      )

    case 'tabelle':
      return <ChatTabelle block={block} />

    case 'liste': {
      const Tag = block.geordnet ? 'ol' : 'ul'
      return (
        <Tag
          className={cn(
            'text-sm text-ink leading-relaxed pl-5 space-y-1.5',
            block.geordnet ? 'list-decimal' : 'list-disc',
          )}
        >
          {block.punkte.map((p, i) => (
            <li key={i}>
              <MdInline inline>{p}</MdInline>
            </li>
          ))}
        </Tag>
      )
    }

    case 'kennzahl':
      return (
        <div className="inline-flex flex-col bg-paper-muted rounded-card px-4 py-3 self-start">
          <span className="text-xxs font-mono uppercase tracking-widest text-muted">
            {block.label}
          </span>
          <span className="text-2xl font-medium text-ink mt-0.5">
            {block.wert}
            {block.einheit && (
              <span className="text-base text-muted ml-1">{block.einheit}</span>
            )}
          </span>
        </div>
      )
  }
}

// ──────────────────────────── Markdown-Helfer ────────────────────────────
// `inline` = true: Wrapper-`<p>` weglassen, damit der Inhalt direkt in
//             einem `<li>` oder `<span>` stehen kann.

interface MdInlineProps {
  children: string
  inline?: boolean
}

function MdInline({ children, inline }: MdInlineProps): ReactNode {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        strong: ({ children }) => (
          <strong className="font-medium text-ink">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-ink">{children}</em>
        ),
        code: ({ children }) => (
          <code className="px-1 py-0.5 rounded bg-paper-muted text-ink font-mono text-xs">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            {children}
          </a>
        ),
        p: inline
          ? ({ children }) => <>{children}</>
          : ({ children }) => (
              <p className="m-0 [&:not(:first-child)]:mt-2">{children}</p>
            ),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}
