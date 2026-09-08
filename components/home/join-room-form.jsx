'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { roomService } from '@/lib/services/room-service'
import { setStoredName } from '@/lib/identity'
import { Loader2 } from 'lucide-react'

export function JoinRoomForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setError('')
    const res = await roomService.getRoom(trimmed)
    if (!res.ok) {
      setError('No room found with that code.')
      setLoading(false)
      return
    }
    if (res.room.status !== 'active') {
      setError(`This room has ${res.room.status === 'ended' ? 'ended' : 'expired'}.`)
      setLoading(false)
      return
    }
    setStoredName(name.trim() || 'Candidate')
    router.push(`/room/${trimmed}`)
  }

  const fieldClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div>
        <h2 className="font-semibold">Join an interview</h2>
        <p className="text-sm text-muted-foreground">
          Enter the room code your interviewer shared with you.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Room code</span>
        <input
          className={`${fieldClass} font-mono text-lg uppercase tracking-[0.3em]`}
          placeholder="ABC123"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Your name</span>
        <input
          className={fieldClass}
          placeholder="e.g. Sam"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="secondary"
        disabled={loading}
        className="mt-auto"
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {loading ? 'Joining…' : 'Join room'}
      </Button>
    </form>
  )
}
