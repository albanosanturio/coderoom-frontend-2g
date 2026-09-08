'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// CodeMirror touches the DOM, so load it only on the client.
const CodeMirrorInner = dynamic(() => import('./codemirror-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
    </div>
  ),
})

export function CodeEditor(props) {
  return (
    <div className="h-full min-h-0 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono">
      <CodeMirrorInner {...props} />
    </div>
  )
}
