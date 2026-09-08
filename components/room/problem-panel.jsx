export function ProblemPanel({ description }) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Problem
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <p className="whitespace-pre-wrap text-pretty text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  )
}
