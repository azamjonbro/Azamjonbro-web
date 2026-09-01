declare module '*.md' {
  import type { ArticleMeta } from '../plugins/markdown'
  const article: { meta: ArticleMeta; html: string }
  export default article
}
