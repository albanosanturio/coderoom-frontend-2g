'use client'

import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'

const EXTENSIONS = {
  javascript: [javascript()],
  python: [python()],
}

export default function CodeMirrorInner({ value, language, editable, onChange }) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      theme={oneDark}
      editable={editable}
      extensions={EXTENSIONS[language] || EXTENSIONS.javascript}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
        indentOnInput: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: false,
      }}
      style={{ height: '100%', fontSize: 13 }}
    />
  )
}
