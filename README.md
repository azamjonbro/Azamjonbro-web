# azamjonbro.uz

A personal site built around a single interactive 3D room.

The room is not a hero banner that scrolls away — it sits behind the entire
document, and scrolling moves the camera through it. Each section has its own
framing, and the page's content layer reads over the top. In the hero, before
anything else has arrived, the room is fully interactive: move the mouse to
look around, hover anything on the desk to name it, click to inspect it, and
click the monitor to sit down and use the machine.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run preview  # serve the production build
npm run lint
```

## How it fits together

```
src/
├── components/
│   ├── site/            the scrolling document
│   │   ├── Primitives   Section · Reveal · SectionHead · Magnetic · RiseText
│   │   ├── Hero         type over the room, with nothing behind it
│   │   ├── Projects     the seven case studies, as an index
│   │   ├── CaseStudy    the sheet one project opens into
│   │   ├── About · Skills · Experience · Process · Capabilities · Contact
│   │   ├── Nav          fixed navigation, mobile sheet, section rail
│   │   └── Scrim        the readability layer over the 3D
│   ├── room/            everything inside the <Canvas>
│   │   ├── RoomScene    canvas, tiered post-processing, scene assembly
│   │   ├── CameraRig    scroll-driven shot list + damped mouse-look
│   │   ├── Shell        floor, walls, window, curtains, shelf
│   │   ├── Desk · Props · WallDisplays
│   │   ├── MonitorScreen the machine, rendered as real DOM in 3D
│   │   └── Hotspot      the shared interaction contract
│   ├── RoomLayer        the 3D layer + its own chrome, lazily imported
│   └── ui/              overlays outside the canvas
│       ├── InfoPanel · Tooltip · LoadingScreen · ResumeViewer
│       └── computer/    FileExplorer · CodeEditor · Terminal
├── data/
│   ├── projects.ts             the seven case studies — the only place they live
│   ├── site.ts                 every word the site says about its owner
│   ├── interactiveObjects.ts   what each object in the room says when clicked
│   └── fileSystem.ts           the virtual filesystem the IDE browses
├── lib/
│   ├── layout.ts        single source of geometry truth, incl. the shot list
│   ├── scroll.ts        smooth scroll, section registry, scroll → camera stage
│   ├── reveal.ts        the fail-open check behind every scroll reveal
│   └── textures · pointer · uiSounds · ambientAudio
└── state/RoomContext    hover, selection, view mode, active section, overlays
```

### Content lives in two files

`src/data/site.ts` holds the navigation, the About copy, the skill groups, the
experience entries, the six process stages, the capability cards and the
contact links. `src/data/projects.ts` holds the seven projects. Nothing is
hard-coded in a component, so the site can be rewritten without opening one.

### Screenshots

`public/projects/*.webp` are generated placeholder plates. Overwrite a file to
replace it — no code change. See `public/projects/README.md`.

### How scrolling drives the camera

Every `<Section>` registers itself with `lib/scroll`. The scroll position is
turned into a continuous `stage` value — the integer part is the section, the
fraction is the eased transition into the next one — and `CameraRig`
interpolates `CAMERA.shots` with it. A shot is held until the next section is
within about a screen of the top, then eases across so it arrives exactly as
that section does, which is why long sections hold their framing while being
read instead of drifting the whole way.

`scroll` is sampled from both the frame loop and the native scroll event. The
frame loop is what the camera needs; the event is what keeps the navigation's
active section correct when `requestAnimationFrame` is being throttled.

### Things worth knowing before editing

- **`lib/layout.ts` is the single source of geometry truth.** The camera, the
  monitor, the wall displays and the shot list all read from it, so they cannot
  drift apart.
- **Textures are procedural.** Marble, the night skyline, the rug, the keycaps
  and the wall panels are all drawn on a canvas at runtime — no image assets
  and no CDN. `useProceduralTexture` disposes them on unmount.
- **The room takes the pointer only in the hero.** `.room-layer` drops
  `pointer-events` once the page has scrolled past it, which is also what stops
  R3F raycasting the scene on every pointer move.
- **Scroll reveals fail open.** If `IntersectionObserver` never reports — a
  suspended tab, an embedded webview — every reveal shows itself rather than
  leaving the page permanently blank. See `lib/reveal.ts`.
- **`CameraRig` orbits the shot's aim point rather than turning in place.** A
  head turn makes objects slide out from under the cursor as you reach for
  them; an orbit keeps them still. It also replays the last pointer event while
  the camera settles, so hover never goes stale.
- **`onPointerMissed` checks the event target.** R3F attaches its listeners to
  the canvas' parent, so clicks inside the monitor's DOM arrive there too.
- **Small props carry an invisible `<HitBox>`.** Raycasting ignores `visible`,
  so a mouse or a clock gets a hit area a person can actually land on.
- **Touch gets the room, not the machine.** Phones render the scene with
  shadows, ambient occlusion, depth of field and the outline pass off, and
  without the monitor's DOM-in-3D screen — the visual identity survives, the
  GPU cost does not.

### The layout editor

The room's props can be dragged and rotated. It is the owner's tool, not a
visitor's, so it opens behind a flag:

```
http://localhost:5173/?edit
```

Positions persist to `localStorage`. `?nofx` disables post-processing, which is
useful when profiling.

## Deployment

Vercel, configured in `vercel.json`: `npm run build` → `dist`, SPA rewrites,
immutable caching for hashed assets and fonts, and a permanent redirect from
`www.azamjonbro.uz` to the apex so the canonical URL stays single.
