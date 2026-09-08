import { CreateRoomForm } from '@/components/home/create-room-form'
import { JoinRoomForm } from '@/components/home/join-room-form'
import { Terminal } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-svh">
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col px-4 py-6">
        <header className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Terminal className="size-4" aria-hidden="true" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-tight">coderoom</span>
        </header>

        <div className="flex flex-1 flex-col justify-center gap-10 py-12">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
              real-time collaborative coding interviews
            </p>
            <h1 className="text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
              Create a room. Share the code. Solve it together.
            </h1>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              One shared editor, live for everyone in the room. Run JavaScript or
              Python right in the browser and watch the output appear for the whole
              interview at once.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CreateRoomForm />
            <JoinRoomForm />
          </div>
        </div>

        <footer className="pt-6 font-mono text-xs text-muted-foreground">
          MVP — backend calls are mocked and synced across your open tabs.
        </footer>
      </div>
    </main>
  )
}
