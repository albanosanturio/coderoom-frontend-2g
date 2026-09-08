function initials(name) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ParticipantList({ participants, currentSessionId }) {
  const sorted = [...participants].sort((a, b) => {
    if (a.role === b.role) return a.connected_at - b.connected_at
    return a.role === 'interviewer' ? -1 : 1
  })

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Participants ({participants.length})
        </h2>
      </div>
      <ul className="min-h-0 flex-1 overflow-auto p-2">
        {sorted.map((p) => (
          <li
            key={p.session_id}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-medium text-secondary-foreground">
              {initials(p.name)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">
              {p.name}
              {p.session_id === currentSessionId && (
                <span className="text-muted-foreground"> (you)</span>
              )}
            </span>
            {p.role === 'interviewer' && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-primary">
                host
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
