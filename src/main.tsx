import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

/**
 * Fonts are awaited before the first render.
 *
 * Labels inside the 3D world are drawn into canvases, and a canvas takes
 * whatever face is available at the moment it draws — starting early would
 * bake the fallback font into a texture that is never regenerated. The faces
 * are preloaded in the document head, so this resolves almost immediately;
 * the timeout is there so a font that never arrives cannot hold the page.
 */
const ready =
  typeof document !== 'undefined' && 'fonts' in document
    ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))])
    : Promise.resolve()

ready.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
