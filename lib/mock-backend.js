// Mock real-time backend for the coding interview app.
//
// This simulates a server + real-time layer entirely in the browser using
// localStorage (persistence across refresh) and BroadcastChannel (cross-tab
// real-time sync). Every function is async and returns a plain object, so the
// call sites can be swapped for real `fetch`/websocket calls later without
// touching the UI.

const STORAGE_KEY = 'coderoom.rooms.v1'
const CHANNEL_NAME = 'coderoom.sync.v1'
const NETWORK_DELAY = 120 // ms, to mimic a round-trip
const INACTIVITY_MS = 1000 * 60 * 30 // rooms expire after 30 min idle
const PRESENCE_TTL = 12000 // a participant is "online" if seen within 12s

const isBrowser = typeof window !== 'undefined'

let channel = null
function getChannel() {
  if (!isBrowser) return null
  if (!channel && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME)
  }
  return channel
}

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY))
}

function readAll() {
  if (!isBrowser) return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeAll(rooms) {
  if (!isBrowser) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
  const ch = getChannel()
  if (ch) ch.postMessage({ type: 'rooms.changed' })
}

function generateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const values = new Uint32Array(6)
  if (isBrowser && window.crypto) {
    window.crypto.getRandomValues(values)
    for (let i = 0; i < 6; i++) code += alphabet[values[i] % alphabet.length]
  } else {
    for (let i = 0; i < 6; i++)
      code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

// Applies expiration + presence pruning and returns a normalized copy.
function normalize(room) {
  if (!room) return null
  const now = Date.now()
  if (room.status === 'active' && now - room.last_activity_at > INACTIVITY_MS) {
    room.status = 'expired'
  }
  room.participants = (room.participants || []).filter(
    (p) => now - p.last_seen < PRESENCE_TTL,
  )
  return room
}

function persist(code, room) {
  const rooms = readAll()
  rooms[code] = room
  writeAll(rooms)
  return room
}

// ---- Public API -----------------------------------------------------------

export async function createRoom({ problem, language, starterCode, sessionId }) {
  const rooms = readAll()
  let code = generateCode()
  while (rooms[code]) code = generateCode()

  const now = Date.now()
  const room = {
    code,
    status: 'active',
    problem_description: problem?.trim() || 'No problem description provided.',
    language: language === 'python' ? 'python' : 'javascript',
    starter_code: starterCode || '',
    current_code: starterCode || '',
    interviewer_session_id: sessionId,
    execution: null,
    participants: [],
    created_at: now,
    last_activity_at: now,
  }
  persist(code, room)
  return delay({ ok: true, room })
}

export async function getRoom(code) {
  const rooms = readAll()
  const room = normalize(rooms[(code || '').toUpperCase()])
  if (!room) return delay({ ok: false, error: 'not_found' })
  persist(room.code, room)
  return delay({ ok: true, room })
}

export async function joinRoom(code, { name, sessionId, role }) {
  code = (code || '').toUpperCase()
  const rooms = readAll()
  const room = normalize(rooms[code])
  if (!room) return delay({ ok: false, error: 'not_found' })
  if (room.status !== 'active') return delay({ ok: false, error: room.status })

  const now = Date.now()
  // The interviewer role is only granted to the session that created the room.
  const resolvedRole =
    sessionId === room.interviewer_session_id ? 'interviewer' : 'candidate'

  const existing = room.participants.find((p) => p.session_id === sessionId)
  if (existing) {
    existing.name = name || existing.name
    existing.last_seen = now
    existing.role = resolvedRole
  } else {
    room.participants.push({
      session_id: sessionId,
      name: name || 'Guest',
      role: resolvedRole,
      connected_at: now,
      last_seen: now,
    })
  }
  room.last_activity_at = now
  persist(code, room)
  return delay({ ok: true, room, role: resolvedRole })
}

export async function heartbeat(code, sessionId) {
  code = (code || '').toUpperCase()
  const rooms = readAll()
  const room = normalize(rooms[code])
  if (!room) return { ok: false }
  const p = room.participants.find((x) => x.session_id === sessionId)
  if (p) {
    p.last_seen = Date.now()
    persist(code, room)
  }
  return { ok: true }
}

export async function leaveRoom(code, sessionId) {
  code = (code || '').toUpperCase()
  const rooms = readAll()
  const room = rooms[code]
  if (!room) return { ok: false }
  room.participants = (room.participants || []).filter(
    (p) => p.session_id !== sessionId,
  )
  persist(code, room)
  return { ok: true }
}

export async function updateCode(code, nextCode, sessionId) {
  code = (code || '').toUpperCase()
  const rooms = readAll()
  const room = normalize(rooms[code])
  if (!room || room.status !== 'active') return { ok: false }
  room.current_code = nextCode
  room.last_activity_at = Date.now()
  const p = room.participants.find((x) => x.session_id === sessionId)
  if (p) p.last_seen = Date.now()
  persist(code, room)
  return { ok: true }
}

export async function resetCode(code, sessionId) {
  code = (code || '').toUpperCase()
  const rooms = readAll()
  const room = normalize(rooms[code])
  if (!room) return delay({ ok: false, error: 'not_found' })
  if (sessionId !== room.interviewer_session_id)
    return delay({ ok: false, error: 'forbidden' })
  room.current_code = room.starter_code
  room.last_activity_at = Date.now()
  persist(code, room)
  return delay({ ok: true, room })
}

export async function endRoom(code, sessionId) {
  code = (code || '').toUpperCase()
  const rooms = readAll()
  const room = normalize(rooms[code])
  if (!room) return delay({ ok: false, error: 'not_found' })
  if (sessionId !== room.interviewer_session_id)
    return delay({ ok: false, error: 'forbidden' })
  room.status = 'ended'
  room.last_activity_at = Date.now()
  persist(code, room)
  return delay({ ok: true, room })
}

export async function broadcastExecution(code, result) {
  code = (code || '').toUpperCase()
  const rooms = readAll()
  const room = normalize(rooms[code])
  if (!room || room.status !== 'active') return { ok: false }
  room.execution = result
  room.last_activity_at = Date.now()
  persist(code, room)
  return { ok: true }
}

// Subscribe to any change to the store. Fires on cross-tab broadcasts and on
// localStorage events from other tabs. Returns an unsubscribe function.
export function subscribe(callback) {
  if (!isBrowser) return () => {}
  const ch = getChannel()
  const onMessage = () => callback()
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) callback()
  }
  if (ch) ch.addEventListener('message', onMessage)
  window.addEventListener('storage', onStorage)
  return () => {
    if (ch) ch.removeEventListener('message', onMessage)
    window.removeEventListener('storage', onStorage)
  }
}
