import { Loader2 } from 'lucide-react'

export function OutputPanel({ execution, running, runStatus }) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Output
        </h2>
        {execution && !running && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {execution.participant_name} · {new Date(execution.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed">
        {running ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            {runStatus || 'Running…'}
          </p>
        ) : !execution ? (
          <p className="text-muted-foreground">
            Run the code to see output here. Results are shared with everyone in the room.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {execution.output && (
              <pre className="whitespace-pre-wrap text-foreground">{execution.output}</pre>
            )}
            {execution.error && (
              <pre className="whitespace-pre-wrap text-destructive">{execution.error}</pre>
            )}
            {!execution.output && !execution.error && (
              <p className="text-muted-foreground">(no output)</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
