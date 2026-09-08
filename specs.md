# Coderoom — Technical Specs

Coderoom is a collaborative coding-interview app. The **frontend is real and
interactive; only its backend service is mocked.** The UI talks to a single
service seam (`RoomService`) that currently resolves to a browser-local mock
and can later be swapped for a real HTTP/WebSocket backend without touching any
component.

```
User ──▶ Frontend (real, interactive) ──▶ RoomService seam ──▶ Mock implementation
                                                              └▶ (future) HTTP/WS backend
```

---

## Architecture

### Service seam (the swap point)

- `lib/services/room-service.js` — the **only** module the app imports for
  backend calls. Exports `roomService`, documents the full interface, and
  selects an implementation via `NEXT_PUBLIC_ROOM_SERVICE` (defaults to
  `mock`).
- `lib/services/room-service.mock.js` — the mock implementation
  (`mockRoomService`), backed by `localStorage` for persistence and
  `BroadcastChannel` for cross-tab realtime sync.
- No component or hook touches a transport (`fetch`, `localStorage`,
  `BroadcastChannel`) directly. All access goes through `roomService.*`.

### Frontend structure

- `app/page.jsx` — home screen (create / join a room).
- `app/room/[code]/page.jsx` — room route.
- `components/home/` — `create-room-form.jsx`, `join-room-form.jsx`.
- `components/room/` — `room-client.jsx` (orchestrator), `room-header.jsx`,
  `problem-panel.jsx`, `participant-list.jsx`, `controls-bar.jsx`,
  `output-panel.jsx`, `code-editor.jsx`, `codemirror-inner.jsx`.
- `lib/use-room.js` — React hook wrapping `roomService` (state, polling,
  heartbeat, subscription lifecycle).
- `lib/identity.js` — per-browser session id (stable participant identity).
- `lib/runner.js` — in-browser code execution (JS in a Web Worker, Python via
  Pyodide). This is a client-side capability, not a backend call.

### RoomService interface

`createRoom`, `getRoom`, `joinRoom`, `heartbeat`, `leaveRoom`, `updateCode`,
`resetCode`, `endRoom`, `broadcastExecution`, `subscribe`. All methods are
`async` (except `subscribe`, which returns an unsubscribe function) with
transport-agnostic shapes so a real backend can implement them 1:1.

---

## Frontend

### Done

- Home screen: create a room (name, problem prompt, language, optional starter
  code) and join by room code, with validation and error states.
- Room screen: shared CodeMirror editor with JS/Python syntax highlighting and
  line numbers, problem panel, live participant list with host badge,
  interviewer controls (Reset / End), and a shared output panel.
- In-browser execution: JavaScript in a timeout-guarded Web Worker; Python via
  lazily loaded Pyodide (CDN).
- Realtime feel across tabs of the same browser (BroadcastChannel + polling).
- Session identity, heartbeat/presence, reconnect on refresh.
- Dark/light theming, responsive layout.

### Left to do

- True cross-device realtime (requires the real backend; see below).
- Auth / accounts (currently anonymous per-browser session identity).
- Server-side persistence and room history / audit.
- Multi-cursor / operational-transform or CRDT editing (current sync is
  last-write-wins on the shared code buffer).
- Sandboxed server-side code execution for untrusted languages / resource
  limits beyond what the browser worker provides.
- Access control on interviewer-only actions enforced server-side.

---

## Backend

### Status: mocked

There is no server backend yet. The mock implementation
(`room-service.mock.js`) simulates one entirely in the browser:

- **Storage:** `localStorage` (rooms, participants, code, execution results).
- **Realtime:** `BroadcastChannel` for same-browser tab sync; the hook also
  polls as a fallback.
- **Room codes, roles (host vs participant), expiration, presence/heartbeat:**
  all handled in the mock.

### What's mocked vs. real

- **Real:** the entire frontend, and client-side code execution
  (`lib/runner.js`) — these run for real and are not part of the backend.
- **Mocked:** everything behind `roomService` — persistence, room lifecycle,
  presence, and cross-client messaging.

### To go live

1. Add `lib/services/room-service.http.js` exporting an object with the same
   method signatures as the mock.
2. Register it in the `implementations` map in `room-service.js`.
3. Set `NEXT_PUBLIC_ROOM_SERVICE=http`.

No hook or component changes required — the frontend stays exactly as is.
Realtime should be backed by WebSockets/SSE in `subscribe`, replacing the
BroadcastChannel mechanism transparently.
