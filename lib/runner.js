// Client-side code execution. JavaScript runs in a throwaway Web Worker so an
// infinite loop can be terminated by a timeout. Python runs via Pyodide, loaded
// lazily from the CDN and cached for the rest of the session.

const JS_TIMEOUT = 4000

export function runJavaScript(source) {
  return new Promise((resolve) => {
    const workerSource = `
      self.onmessage = (e) => {
        const logs = []
        const format = (v) => {
          if (typeof v === 'string') return v
          try { return JSON.stringify(v) } catch { return String(v) }
        }
        const push = (args) => logs.push(args.map(format).join(' '))
        const console = {
          log: (...a) => push(a),
          info: (...a) => push(a),
          warn: (...a) => push(a),
          error: (...a) => push(a),
          debug: (...a) => push(a),
        }
        try {
          const result = new Function('console', e.data)(console)
          if (result !== undefined) logs.push(format(result))
          self.postMessage({ ok: true, output: logs.join('\\n') })
        } catch (err) {
          self.postMessage({ ok: false, output: logs.join('\\n'), error: String(err) })
        }
      }
    `
    let worker
    let timer
    try {
      const blob = new Blob([workerSource], { type: 'application/javascript' })
      worker = new Worker(URL.createObjectURL(blob))
    } catch (err) {
      resolve({ output: '', error: 'Failed to start runtime: ' + String(err) })
      return
    }

    const cleanup = () => {
      clearTimeout(timer)
      worker.terminate()
    }
    timer = setTimeout(() => {
      cleanup()
      resolve({ output: '', error: `Execution timed out after ${JS_TIMEOUT}ms.` })
    }, JS_TIMEOUT)

    worker.onmessage = (e) => {
      cleanup()
      resolve({ output: e.data.output || '', error: e.data.error || '' })
    }
    worker.onerror = (e) => {
      cleanup()
      resolve({ output: '', error: e.message || 'Runtime error.' })
    }
    worker.postMessage(source)
  })
}

let pyodidePromise = null

function loadPyodide(onStatus) {
  if (pyodidePromise) return pyodidePromise
  pyodidePromise = new Promise((resolve, reject) => {
    const CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    const start = () => {
      onStatus?.('Initializing Python runtime…')
      window
        .loadPyodide({ indexURL: CDN })
        .then(resolve)
        .catch(reject)
    }
    if (window.loadPyodide) return start()
    onStatus?.('Downloading Python runtime…')
    const script = document.createElement('script')
    script.src = CDN + 'pyodide.js'
    script.onload = start
    script.onerror = () => reject(new Error('Failed to load Pyodide from CDN.'))
    document.head.appendChild(script)
  })
  return pyodidePromise
}

export async function runPython(source, onStatus) {
  let pyodide
  try {
    pyodide = await loadPyodide(onStatus)
  } catch (err) {
    return { output: '', error: String(err) }
  }
  onStatus?.('Running…')
  try {
    pyodide.runPython(`
import sys, io
_buf = io.StringIO()
sys.stdout = _buf
sys.stderr = _buf
`)
    await pyodide.runPythonAsync(source)
    const output = pyodide.runPython('_buf.getvalue()')
    return { output: output || '', error: '' }
  } catch (err) {
    let output = ''
    try {
      output = pyodide.runPython('_buf.getvalue()')
    } catch {}
    return { output, error: String(err) }
  }
}

export function runCode(language, source, onStatus) {
  return language === 'python'
    ? runPython(source, onStatus)
    : runJavaScript(source)
}
