import { useMemo } from 'react'
import type { Language, VFile } from '@/data/fileSystem'

const KEYWORDS =
  /\b(import|from|export|default|function|return|const|let|var|if|else|for|of|in|new|type|interface|extends|implements|async|await|class|null|undefined|true|false|this)\b/

const TOKEN_PATTERNS: { kind: string; re: RegExp }[] = [
  { kind: 'comment', re: /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/ },
  { kind: 'string', re: /^(`[^`]*`|'[^']*'|"[^"]*")/ },
  { kind: 'keyword', re: new RegExp(`^${KEYWORDS.source}`) },
  { kind: 'number', re: /^\b\d+(\.\d+)?\b/ },
  { kind: 'tag', re: /^<\/?[A-Za-z][\w.]*/ },
  { kind: 'fn', re: /^[A-Za-z_$][\w$]*(?=\()/ },
  { kind: 'prop', re: /^[A-Za-z_$][\w$]*(?=:)/ },
  { kind: 'punct', re: /^[{}()[\].,;:=<>+\-*/!?&|%]/ },
  { kind: 'word', re: /^[A-Za-z_$][\w$]*/ },
  { kind: 'space', re: /^\s+/ },
  { kind: 'other', re: /^[\s\S]/ },
]

interface Token {
  kind: string
  text: string
}

function tokenize(line: string): Token[] {
  const out: Token[] = []
  let rest = line
  let guard = 0

  while (rest.length && guard++ < 500) {
    let matched = false
    for (const { kind, re } of TOKEN_PATTERNS) {
      const m = re.exec(rest)
      if (!m) continue
      out.push({ kind, text: m[0] })
      rest = rest.slice(m[0].length)
      matched = true
      break
    }
    if (!matched) break
  }

  return out
}

/** Plain-text languages get no highlighting, only line numbers. */
const PLAIN: Language[] = ['md']

export function CodeEditor({ file }: { file: VFile | null }) {
  const lines = useMemo(() => (file ? file.content.split('\n') : []), [file])

  if (!file) {
    return (
      <div className="vm-editor vm-editor-empty">
        <p>No file open</p>
        <p className="vm-dim">Pick something from the explorer on the left.</p>
      </div>
    )
  }

  const plain = PLAIN.includes(file.language)

  return (
    <div className="vm-editor">
      <pre className="vm-code">
        {lines.map((line, i) => (
          <div className="vm-line" key={i}>
            <span className="vm-gutter">{i + 1}</span>
            <span className="vm-line-text">
              {plain ? (
                line || ' '
              ) : (
                tokenize(line).map((t, j) => (
                  <span key={j} className={`t-${t.kind}`}>
                    {t.text}
                  </span>
                ))
              )}
              {!line && !plain ? ' ' : null}
            </span>
          </div>
        ))}
      </pre>
    </div>
  )
}
