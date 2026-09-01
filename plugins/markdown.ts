import { marked } from 'marked'
import type { Plugin } from 'vite'

/**
 * Turns a `.md` file into a module: `{ meta, html }`.
 *
 * The parsing happens at build time, so no markdown library ships to the
 * browser — an article costs exactly the bytes of its own prose. Articles are
 * plain files on disk, which is the whole point: writing one is opening an
 * editor, not touching a component.
 */
export interface ArticleMeta {
  slug: string
  title: string
  /** Which project the piece came out of. Free text. */
  project?: string
  summary: string
  /** `draft` renders a visible badge; `published` does not. */
  status: 'draft' | 'published'
  tags: string[]
  /** Estimated from the body — never written by hand, so it cannot go stale. */
  minutes: number
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

/**
 * A deliberately small YAML subset: `key: value` and `key: [a, b, c]`.
 *
 * A real YAML parser would be a dependency and a footgun for content this
 * simple; anything it would add is something an article does not need.
 */
function parseFrontmatter(raw: string) {
  const out: Record<string, string | string[]> = {}

  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const at = trimmed.indexOf(':')
    if (at === -1) continue

    const key = trimmed.slice(0, at).trim()
    let value = trimmed.slice(at + 1).trim()

    if (value.startsWith('[') && value.endsWith(']')) {
      out[key] = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
      continue
    }

    value = value.replace(/^['"]|['"]$/g, '')
    out[key] = value
  }

  return out
}

/** 200 words per minute, rounded up, floor of one. */
function readingMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function markdown(): Plugin {
  return {
    name: 'lab-markdown',
    enforce: 'pre',

    transform(code, id) {
      if (!id.endsWith('.md')) return null

      const match = code.match(FRONTMATTER)
      const front = match ? parseFrontmatter(match[1]) : {}
      const body = match ? code.slice(match[0].length) : code

      const slug =
        (front.slug as string) ??
        id.split('/').pop()!.replace(/\.md$/, '').replace(/^\d+[-_]/, '')

      const meta: ArticleMeta = {
        slug,
        title: (front.title as string) ?? slug,
        project: front.project as string | undefined,
        summary: (front.summary as string) ?? '',
        status: front.status === 'published' ? 'published' : 'draft',
        tags: Array.isArray(front.tags) ? front.tags : [],
        minutes: readingMinutes(body),
      }

      const html = marked.parse(body, { async: false, gfm: true, breaks: false })

      return {
        code: `export default ${JSON.stringify({ meta, html })}`,
        map: null,
      }
    },
  }
}
