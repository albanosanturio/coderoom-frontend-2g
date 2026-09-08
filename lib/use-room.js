'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from './mock-backend'
import { getSessionId } from './identity'

// Joins a room, keeps a live copy in state via cross-tab subscription +
// heartbeat, and exposes the interviewer/candidate actions.
export function useRoom(code, name) {
  const [room, setRoom] = useState(null)
  const [status, setStatus] = useState('connecting') // connecting | ready | not_found | ended | expired | error
  const sessionId = useRef(getSessionId())

  const refresh = useCallback(async () => {
    const res = await api.getRoom(code)
    if (!res.ok) {
      setStatus((s) => (s === 'ready' ? s : 'not_found'))
      return null
    }
    setRoom(res.room)
    return res.room
  }, [code])

  useEffect(() => {
    let active = true
    let heartbeatTimer

    async function init() {
      const res = await api.joinRoom(code, { name, sessionId: sessionId.current })
      if (!active) return
      if (!res.ok) {
        setStatus(res.error === 'not_found' ? 'not_found' : res.error)
        return
      }
      setRoom(res.room)
      setStatus('ready')
    }

    init()

    const unsubscribe = api.subscribe(() => {
      if (active) refresh()
    })

    heartbeatTimer = setInterval(async () => {
      await api.heartbeat(code, sessionId.current)
      if (active) refresh()
    }, 5000)

    const onUnload = () => api.leaveRoom(code, sessionId.current)
    window.addEventListener('beforeunload', onUnload)

    return () => {
      active = false
      clearInterval(heartbeatTimer)
      unsubscribe()
      window.removeEventListener('beforeunload', onUnload)
      api.leaveRoom(code, sessionId.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, name])

  const isInterviewer =
    !!room && room.interviewer_session_id === sessionId.current

  const pushCode = useCallback(
    async (next) => {
      setRoom((r) => (r ? { ...r, current_code: next } : r))
      await api.updateCode(code, next, sessionId.current)
    },
    [code],
  )

  const reset = useCallback(async () => {
    const res = await api.resetCode(code, sessionId.current)
    if (res.ok) setRoom(res.room)
  }, [code])

  const end = useCallback(async () => {
    const res = await api.endRoom(code, sessionId.current)
    if (res.ok) setRoom(res.room)
    else refresh()
  }, [code, refresh])

  const publishExecution = useCallback(
    async (result) => {
      setRoom((r) => (r ? { ...r, execution: result } : r))
      await api.broadcastExecution(code, result)
    },
    [code],
  )

  return {
    room,
    status,
    sessionId: sessionId.current,
    isInterviewer,
    actions: { pushCode, reset, end, publishExecution, refresh },
  }
}
