import { useCallback, useSyncExternalStore } from 'react'

/**
 * A router for four routes.
 *
 * `/`, `/world`, `/blog` and `/blog/:slug` do not need nested layouts, loaders
 * or route-level code splitting — and a routing library would be the second
 * largest thing in the bundle a phone downloads to read a landing page. This
 * is the History API with a subscription, which is all the above amounts to
 * at this size.
 */

type Listener = () => void
const listeners = new Set<Listener>()

function emit() {
  for (const fn of listeners) fn()
}

function subscribe(fn: Listener) {
  listeners.add(fn)
  window.addEventListener('popstate', fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('popstate', fn)
  }
}

function getPath() {
  if (typeof window === 'undefined') return '/'
  /* Trailing slashes are normalised away so `/blog` and `/blog/` are one
     route rather than two that look identical and behave differently. */
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function usePathname() {
  return useSyncExternalStore(subscribe, getPath, () => '/')
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  if (getPath() === to.replace(/\/+$/, '')) return

  window.history[options.replace ? 'replaceState' : 'pushState']({}, '', to)
  /* A new page starts at its own top. Browsers restore scroll on popstate,
     which is right for Back and wrong for a fresh navigation. */
  window.scrollTo(0, 0)
  emit()
}

/** Navigates without a full reload, while staying a real link. */
export function useNavigate() {
  return useCallback((to: string) => navigate(to), [])
}

/**
 * Reads `/blog/:slug`. Returns null for anything else, so a caller can treat
 * "not an article route" and "article that does not exist" separately.
 */
export function articleSlug(pathname: string) {
  const match = pathname.match(/^\/blog\/([A-Za-z0-9._~-]+)$/)
  return match ? match[1] : null
}

export const routes = {
  home: '/',
  world: '/world',
  blog: '/blog',
  article: (slug: string) => `/blog/${slug}`,
} as const
