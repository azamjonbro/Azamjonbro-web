import { useEffect, useRef, useState } from 'react'
import { useRoom } from '@/state/RoomContext'
import '@/styles/resume.css'

/** Lives in /public, so it is served as-is and stays downloadable. */
const RESUME_URL = '/resume.pdf'

/**
 * Viewer parameters for the browser's built-in PDF plugin: hide its own
 * chrome and fit the page to the sheet's width, so the document reads as
 * a plain white page rather than a nested app.
 */
const VIEWER_PARAMS = '#toolbar=0&navpanes=0&scrollbar=1&view=FitH'

/**
 * The resume, opened by clicking the MacBook.
 *
 * Rendered as a white sheet over the room rather than onto the laptop's
 * 3D panel: a CV only works if it can actually be read, and the native
 * PDF frame gives real scrolling, text selection and search for free.
 */
export function ResumeViewer() {
  const { resumeOpen, closeResume } = useRoom()
  const sheet = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  /* Move focus into the sheet so the PDF frame takes the keyboard,
     and stop the room behind it from scrolling. */
  useEffect(() => {
    if (!resumeOpen) return
    const previous = document.activeElement as HTMLElement | null
    sheet.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [resumeOpen])

  if (!resumeOpen) return null

  return (
    <div
      className="resume-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Resume"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) closeResume()
      }}
    >
      <div className="resume-sheet" ref={sheet} tabIndex={-1}>
        <header className="resume-bar">
          <div className="resume-bar__title">
            <span className="resume-bar__name">Azamjon Abdullayev</span>
            <span className="resume-bar__meta">Resume — PDF</span>
          </div>

          <a className="resume-btn" href={RESUME_URL} download="Azamjon-Abdullayev-Resume.pdf">
            Download
          </a>
          <a className="resume-btn" href={RESUME_URL} target="_blank" rel="noreferrer">
            Open tab
          </a>
          <button
            type="button"
            className="resume-btn resume-btn--close"
            onClick={closeResume}
            aria-label="Close resume"
          >
            ×
          </button>
        </header>

        <div className="resume-doc">
          {failed ? (
            <div className="resume-fallback">
              <p>This browser will not display the PDF inline.</p>
              <a className="resume-btn" href={RESUME_URL} target="_blank" rel="noreferrer">
                Open the resume
              </a>
            </div>
          ) : (
            <iframe
              src={`${RESUME_URL}${VIEWER_PARAMS}`}
              title="Azamjon Abdullayev — Resume"
              onError={() => setFailed(true)}
            />
          )}
        </div>

        <div className="resume-hintbar">
          Scroll to read · <kbd>Esc</kbd> to close
        </div>
      </div>
    </div>
  )
}
