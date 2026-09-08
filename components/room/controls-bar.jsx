'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Play, RotateCcw, Square } from 'lucide-react'

export function ControlsBar({
  isInterviewer,
  disabled,
  running,
  onRun,
  onReset,
  onEnd,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={onRun} disabled={disabled || running}>
        {running ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Play className="size-4" aria-hidden="true" />
        )}
        Run
      </Button>

      {isInterviewer && (
        <>
          <Button variant="secondary" onClick={onReset} disabled={disabled}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
          <Button variant="destructive" onClick={onEnd} disabled={disabled}>
            <Square className="size-4" aria-hidden="true" />
            End interview
          </Button>
        </>
      )}
    </div>
  )
}
