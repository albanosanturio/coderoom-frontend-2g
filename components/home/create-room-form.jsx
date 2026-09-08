'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { roomService } from '@/lib/services/room-service'
import { getSessionId, getStoredName, setStoredName } from '@/lib/identity'
import { Loader2 } from 'lucide-react'

const STARTERS = {
  javascript: `function solution() {
  // write your solution here
  return "hello"
}

console.log(solution())
`,
  python: `def solution():
    # write your solution here
    return "hello"

print(solution())
`,
}

export function CreateRoomForm() {
  const router = useRouter()
  const [language, setLanguage] = useState('javascript')
  const [problem, setProblem] = useState('')
  const [starter, setStarter] = useState(STARTERS.javascript)
  const [name, setName] = useState('')
  const [touchedStarter, setTouchedStarter] = useState(false)
  const [loading, setLoading] = useState(false)

  function pickLanguage(next) {
    setLanguage(next)
    if (!touchedStarter) setStarter(STARTERS[next])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const displayName = name.trim() || 'Interviewer'
    setStoredName(displayName)
    const res = await roomService.createRoom({
      problem,
      language,
      starterCode: starter,
      sessionId: getSessionId(),
    })
    if (res.ok) router.push(`/room/${res.room.code}`)
    else setLoading(false)
  }

  const fieldClass =
    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div>
        <h2 className="font-semibold">Start an interview</h2>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be the interviewer and get a room code to share.
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Your name</span>
        <input
          className={fieldClass}
          placeholder="e.g. Alex"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Problem description</span>
        <textarea
          className={`${fieldClass} min-h-24 resize-y leading-relaxed`}
          placeholder="Describe the coding problem the candidate should solve…"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Language</span>
        <div className="inline-flex w-fit rounded-md border border-input p-0.5">
          {['javascript', 'python'].map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => pickLanguage(lang)}
              className={`rounded px-3 py-1 font-mono text-xs capitalize transition-colors ${
                language === lang
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Starter code (optional)</span>
        <textarea
          className={`${fieldClass} min-h-28 resize-y font-mono text-xs leading-relaxed`}
          value={starter}
          spellCheck={false}
          onChange={(e) => {
            setStarter(e.target.value)
            setTouchedStarter(true)
          }}
        />
      </label>

      <Button type="submit" disabled={loading} className="mt-1">
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {loading ? 'Creating room…' : 'Create room'}
      </Button>
    </form>
  )
}
