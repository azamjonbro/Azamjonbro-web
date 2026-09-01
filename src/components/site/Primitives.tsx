import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { onObserverUnavailable, observerUnavailable } from '@/lib/reveal'
import { registerSection } from '@/lib/scroll'
import { useRoom } from '@/state/RoomContext'

/**
 * A page section. Registering here is what ties the document to the camera:
 * the scroll system measures these elements and turns the scroll position
 * into the `stage` value CameraRig interpolates its shot list with.
 */
export function Section({
  id,
  label,
  className = '',
  children,
}: {
  id: string
  label: string
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerSection(id, el)
  }, [id])

  return (
    <section id={id} ref={ref} className={`sec ${className}`} aria-label={label}>
      {children}
    </section>
  )
}

/**
 * Reveals its children the first time they scroll into view.
 *
 * One observer per element rather than one shared observer: there are a few
 * dozen of these, they each disconnect after firing, and the alternative is
 * a registry that has to be kept in sync with mounting.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode
  as?: 'div' | 'li' | 'article' | 'header' | 'p' | 'h2'
  delay?: number
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(false)
  const { reducedMotion } = useRoom()

  useEffect(() => {
    const node = ref.current
    if (!node || seen) return
    if (reducedMotion || observerUnavailable()) {
      setSeen(true)
      return
    }

    /* If observation turns out not to work here, show rather than stay
       hidden — see lib/reveal. */
    const release = onObserverUnavailable(() => setSeen(true))

    const io = new IntersectionObserver(
      ([entry]) => {
        /* Anything already above the viewport was arrived at by a jump — a
           deep link, a nav click, a refresh part-way down the page. It will
           never intersect on the way in, so revealing it on scroll alone
           would leave it invisible for the rest of the visit. */
        const passed = entry.boundingClientRect.bottom < 0
        if (!entry.isIntersecting && !passed) return
        setSeen(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )
    io.observe(node)
    return () => {
      release()
      io.disconnect()
    }
  }, [seen, reducedMotion])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal${seen ? ' is-in' : ''} ${className}`}
      style={{ ['--d' as string]: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  )
}

/** The eyebrow + heading pair every section opens with. */
export function SectionHead({
  eyebrow,
  index,
  children,
  lead,
}: {
  eyebrow: string
  index: string
  children: ReactNode
  lead?: string
}) {
  return (
    <header className="sec-head">
      <Reveal className="sec-eyebrow">
        <span className="sec-eyebrow__idx">{index}</span>
        <span className="sec-eyebrow__rule" aria-hidden />
        <span className="sec-eyebrow__label">{eyebrow}</span>
      </Reveal>

      <Reveal as="h2" delay={80} className="sec-title">
        {children}
      </Reveal>

      {lead && (
        <Reveal as="p" delay={160} className="sec-lead">
          {lead}
        </Reveal>
      )}
    </header>
  )
}

/**
 * Pulls its child toward the cursor while the pointer is near it.
 *
 * Transforms are written straight to the node — a magnetic button that
 * re-rendered React on every pointer move would be the most expensive
 * element on the page.
 */
export function Magnetic({
  children,
  strength = 0.32,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const { reducedMotion, isTouch } = useRoom()

  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion || isTouch) return

    const onMove = (e: PointerEvent) => {
      const box = el.getBoundingClientRect()
      const dx = e.clientX - (box.left + box.width / 2)
      const dy = e.clientY - (box.top + box.height / 2)
      el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`
    }
    const onLeave = () => {
      el.style.transform = 'translate3d(0, 0, 0)'
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      onLeave()
    }
  }, [strength, reducedMotion, isTouch])

  return (
    <span ref={ref} className={`magnetic ${className}`}>
      {children}
    </span>
  )
}

/**
 * Splits a line into words that rise into place, staggered.
 * Words rather than characters: a character stagger on a display heading
 * reads as a gimmick and costs one element per glyph.
 */
export function RiseText({
  text,
  className = '',
  delay = 0,
}: {
  text: string
  className?: string
  delay?: number
}) {
  const words = text.split(' ')

  return (
    <span className={`rise ${className}`}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {/* A real space, not a margin: the heading has to read as a
              sentence to a screen reader and survive being copied. */}
          {i > 0 && ' '}
          <span className="rise-mask">
            <span className="rise-word" style={{ ['--d' as string]: `${delay + i * 70}ms` }}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  )
}
