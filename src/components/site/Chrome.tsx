import { site } from '@/data/site'
import { routes } from '@/lib/router'
import { Link } from './Link'

/** The bar on every page route. Deliberately not present inside the world. */
export function SiteHeader({
  canEnterWorld,
  back,
}: {
  canEnterWorld?: boolean
  /** Renders a return link instead of the section nav. */
  back?: { to: string; label: string }
}) {
  return (
    <header className="site-head">
      <Link className="site-mark" to={routes.home}>
        <span className="site-mark__dot" aria-hidden />
        {site.name}
      </Link>

      <nav className="site-nav" aria-label="Site">
        {back ? (
          <Link className="site-link" to={back.to}>
            {back.label}
          </Link>
        ) : (
          <>
            <Link className="site-link" to={routes.blog}>
              BLOG
            </Link>
            {canEnterWorld && (
              <Link className="site-link site-link--3d" to={routes.world}>
                3D DEMO
              </Link>
            )}
          </>
        )}
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <p className="site-foot__brand">
        {site.name} — {site.role}
      </p>
      <p className="site-foot__meta">
        © {new Date().getFullYear()} {site.domain}
      </p>
    </footer>
  )
}
