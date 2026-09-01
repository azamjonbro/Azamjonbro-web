import type { ArticleMeta } from '../../plugins/markdown'

export type { ArticleMeta }

export interface Article {
  meta: ArticleMeta
  html: string
}

/**
 * Every `.md` file in `src/content/lab`, parsed at build time.
 *
 * Eager rather than lazy: the module is only reached from the lab panel,
 * which is itself lazily imported, so the articles land in that chunk and
 * nothing about them is downloaded until somebody opens the lab.
 *
 * Ordering is by filename, which is why the files carry a numeric prefix —
 * the order is an editorial decision and belongs somewhere visible, not in a
 * date field that has to be maintained.
 */
const modules = import.meta.glob<{ default: Article }>('../content/lab/*.md', {
  eager: true,
})

export const articles: Article[] = Object.keys(modules)
  .sort()
  .map((path) => modules[path].default)

export function getArticle(slug: string) {
  return articles.find((a) => a.meta.slug === slug)
}

export const articleCount = articles.length
