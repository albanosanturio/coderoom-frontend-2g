// RoomService — the single seam between the (real, interactive) frontend and
// its backend. The whole app imports `roomService` from here and never talks
// to a transport (localStorage, fetch, websockets) directly.
//
//   User → Frontend → RoomService → [ mock | http | ... ]
//
// Today the only implementation is the in-browser mock. To go live, add an
// HTTP/websocket implementation with the same method signatures and select it
// below — no UI or hook changes required.
//
// The RoomService interface (all methods async unless noted):
//   createRoom({ problem, language, starterCode, sessionId }) -> { ok, room }
//   getRoom(code)                                             -> { ok, room } | { ok:false, error }
//   joinRoom(code, { name, sessionId })                       -> { ok, room, role }
//   heartbeat(code, sessionId)                                -> { ok }
//   leaveRoom(code, sessionId)                                -> { ok }
//   updateCode(code, nextCode, sessionId)                     -> { ok }
//   resetCode(code, sessionId)                                -> { ok, room }
//   endRoom(code, sessionId)                                  -> { ok, room }
//   broadcastExecution(code, result)                          -> { ok }
//   subscribe(callback) [sync]                                -> unsubscribe()

import { mockRoomService } from './room-service.mock'
// import { httpRoomService } from './room-service.http' // future real backend

const implementations = {
  mock: mockRoomService,
  // http: httpRoomService,
}

// Flip via NEXT_PUBLIC_ROOM_SERVICE=http once a real backend exists.
const selected = process.env.NEXT_PUBLIC_ROOM_SERVICE || 'mock'

export const roomService = implementations[selected] || mockRoomService
