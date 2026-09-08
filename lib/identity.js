// A stable per-browser session id + remembered display name. This is the
// "who am I" that the mock backend uses to decide interviewer vs candidate.

const SESSION_KEY = 'coderoom.session'
const NAME_KEY = 'coderoom.name'

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getSessionId() {
  if (typeof window === 'undefined') return ''
  let id = window.localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = uuid()
    window.localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function getStoredName() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(NAME_KEY) || ''
}

export function setStoredName(name) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(NAME_KEY, name)
}
