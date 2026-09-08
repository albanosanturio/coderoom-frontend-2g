'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Copy, Terminal, Users } from 'lucide-react'

export function RoomHeader({ code, language, status, participantCount }) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const statusMeta =
    status === 'active'
      ? { label: 'live', dot: 'bg-primary' }
      : status === 'ended'
        ? { label: 'ended', dot: 'bg-destructive' }
        : { label: 'expired', dot: 'bg-muted-foreground' }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
          aria-label="Back to home"
        >
          <Terminal className="size-4" aria-hidden="true" />
        </Link>
        <button
          onClick={copyCode}
          className="group flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5"
          title="Copy room code"
        >
          <span className="font-mono text-xs text-muted-foreground">room</span>
          <span className="font-mono text-sm font-semibold tracking-[0.2em]">{code}</span>
          {copied ? (
            <Check className="size-3.5 text-primary" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
          )}
          <span className="sr-only">Copy room code</span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="rounded-md border border-border px-2 py-1 font-mono text-xs capitalize text-muted-foreground">
          {language}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-4" aria-hidden="true" />
          {participantCount}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${statusMeta.dot}`} aria-hidden="true" />
          <span className="font-mono text-xs">{statusMeta.label}</span>
        </span>
      </div>
    </header>
  )
}
