import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { navigate } from '@/lib/router'

/**
 * A real anchor that navigates without a reload.
 *
 * It stays an `<a href>` so it can be middle-clicked, opened in a new tab,
 * copied, focused and — the reason this matters for a portfolio — followed by
 * a crawler. The click handler only takes over for a plain left click, which
 * is the one case where a reload would be wasted work.
 */
export function Link({
  to,
  children,
  ...rest
}: { to: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        rest.onClick?.(e)
        if (e.defaultPrevented) return
        /* Let the browser handle anything that is not a plain left click. */
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
}
