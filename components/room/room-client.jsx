'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { useRoom } from '@/lib/use-room'
import { runCode } from '@/lib/runner'
import { getStoredName } from '@/lib/identity'
import { RoomHeader } from './room-header'
import { ProblemPanel } from './problem-panel'
import { ParticipantList } from './participant-list'
import { CodeEditor } from './code-editor'
import { ControlsBar } from './controls-bar'
import { OutputPanel } from './output-panel'

export function RoomClient({ code }) {
  const [name, setName] = useState(null)
  useEffect(() => {
    setName(getStoredName() || 'Guest')
  }, [])

  if (name === null) return <CenteredSpinner label="Loading…" />
  return <RoomInner code={code} name={name} />
}

function RoomInner({ code, name }) {
  const { room, status, sessionId, isInterviewer, actions } = useRoom(code, name)
  const [running, setRunning] = useState(false)
  const [runStatus, setRunStatus] = useState('')

  if (status === 'connecting' && !room) return <CenteredSpinner label="Joining room…" />

  if (!room && (status === 'not_found' || status === 'ended' || status === 'expired')) {
    return (
      <FullScreenMessage
        title={
          status === 'not_found'
            ? 'Room not found'
            : status === 'ended'
              ? 'Interview ended'
              : 'Room expired'
        }
        description={
          status === 'not_found'
            ? 'This room code does not exist. Double-check the code and try again.'
            : 'This room is no longer accepting participants.'
        }
      />
    )
  }

  if (!room) return <CenteredSpinner label="Joining room…" />

  const isActive = room.status === 'active'

  async function handleRun() {
    setRunning(true)
    setRunStatus('Running…')
    const result = await runCode(room.language, room.current_code, setRunStatus)
    await actions.publishExecution({
      participant_name: name,
      language: room.language,
      output: result.output,
      error: result.error,
      timestamp: Date.now(),
    })
    setRunning(false)
    setRunStatus('')
  }

  return (
    <div className="flex h-svh flex-col">
      <RoomHeader
        code={room.code}
        language={room.language}
        status={room.status}
        participantCount={room.participants.length}
      />

      {!isActive && (
        <div className="border-b border-border bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          {room.status === 'ended'
            ? 'This interview has ended. Editing and execution are disabled.'
            : 'This room has expired.'}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[320px_1fr]">
        {/* Left: problem + participants */}
        <div className="flex min-h-0 flex-col gap-3 lg:max-h-full">
          <div className="min-h-40 flex-1">
            <ProblemPanel description={room.problem_description} />
          </div>
          <div className="min-h-32 max-h-56 shrink-0">
            <ParticipantList
              participants={room.participants}
              currentSessionId={sessionId}
            />
          </div>
        </div>

        {/* Right: editor + controls + output */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex min-h-48 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-[#282c34]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <span className="font-mono text-xs uppercase tracking-wider text-white/50">
                Shared editor
              </span>
              {!isInterviewer && (
                <span className="font-mono text-[11px] text-white/40">
                  everyone can edit
                </span>
              )}
            </div>
            <div className="min-h-0 flex-1">
              <CodeEditor
                value={room.current_code}
                language={room.language}
                editable={isActive}
                onChange={actions.pushCode}
              />
            </div>
          </div>

          <ControlsBar
            isInterviewer={isInterviewer}
            disabled={!isActive}
            running={running}
            onRun={handleRun}
            onReset={actions.reset}
            onEnd={actions.end}
          />

          <div className="h-40 shrink-0">
            <OutputPanel execution={room.execution} running={running} runStatus={runStatus} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CenteredSpinner({ label }) {
  return (
    <div className="flex h-svh items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

function FullScreenMessage({ title, description }) {
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      <Link href="/" className={buttonVariants({ size: 'lg' })}>
        Back to home
      </Link>
    </div>
  )
}
