# AZAMJON SPACE

`azamjonbro.uz` — a developer portfolio you walk through.

The visitor boots into a space station, spawns on the deck, and explores.
Seven destinations sit on a ring around a central hub: About, Projects,
Skills, Experience, Process, Lab and Contact. Walking into one lights it and
offers to open it; opening it flies the camera in and raises a holographic
panel. The projects bay holds seven exhibits, each a hologram carrying its
own screenshot.

The content is the point. The station is how it is presented — and every
word of it is also a plain HTML document, so a browser without WebGL, a
search crawler and a screen reader all get the whole portfolio.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run preview  # serve the production build
npm run lint
```

## Controls

|             | Desktop                | Touch              |
| ----------- | ---------------------- | ------------------ |
| Move        | `W` `A` `S` `D` / arrows | floating joystick, left half |
| Look        | drag                   | swipe              |
| Interact    | `E` / `Space` / `Enter` | tap the prompt    |
| Close       | `Esc`                  | tap ✕              |

The compass along the bottom jumps to any destination without walking there.

`?nofx` disables post-processing, which is useful when profiling.

## How it fits together

```
src/
├── data/                    all content, no presentation
│   ├── projects.ts          the seven exhibits
│   ├── skills.ts            five groups; `context` says what each is used for
│   ├── experience.ts        the mission log
│   ├── process.ts           the six stages
│   ├── site.ts              identity, about, contact, lab
│   └── zones.ts             where every destination is — three.js-free on purpose
├── lib/
│   ├── input.ts             keyboard, joystick and drag, collapsed into one struct
│   ├── perf.ts              device tier: dpr, shadows, effects, particle counts
│   ├── bay.ts               layout of the projects arc
│   ├── spaceTextures.ts     every texture and every in-world label, drawn on canvas
│   ├── uiSounds.ts          interaction sounds
│   └── ambientAudio.ts      the ambience behind the SOUND toggle
├── state/WorldContext.tsx   stage, proximity, open panels, quality, capabilities
├── components/
│   ├── world/               everything inside the <Canvas>
│   │   ├── SpaceScene       canvas, tiered post-processing, scene assembly
│   │   ├── CameraRig        follow, cinematic focus, and the arrival move
│   │   ├── Player           the avatar, movement, and all proximity tests
│   │   ├── Station          deck, hub, spokes, rim
│   │   ├── Cosmos           starfield, planet with a rim-lit atmosphere, haze
│   │   ├── ProjectBay       the seven exhibits
│   │   ├── ZoneMarker       a destination pad and its sign
│   │   ├── Structures       the object standing on each pad
│   │   └── Dust             particulate, for scale
│   └── ui/                  the 2D layer
│       ├── Boot             the loading sequence and ENTER THE WORLD
│       ├── Hud              wordmark, prompt, controls hint, compass
│       ├── Panel            the shell every destination opens inside
│       ├── Panels           the content of each destination
│       ├── ProjectPanel     one exhibit, opened
│       ├── Joystick         mobile movement
│       ├── Cursor           the desktop dot
│       └── Fallback         the whole portfolio as a document
└── hooks/
    ├── useControls.ts       binds input and routes the interact key
    └── useTexture.ts        procedural textures that dispose themselves
```

### Content lives in `src/data`

Nothing is hard-coded in a component. Adding a project is one entry in
`projects.ts` — the exhibit, the bay list, the panel and the written document
all read from it. The same is true of skills, experience, process and the
destinations themselves.

### Screenshots

`public/projects/*.webp` are generated placeholder plates. Overwrite a file to
replace it; no code change. See `public/projects/README.md`.

## Things worth knowing before editing

- **`data/zones.ts` deliberately does not import three.js.** It is read by the
  HUD and the panels, which are in the eagerly loaded bundle. Importing a
  vector class there pulls the entire renderer in with it — it did, once, and
  cost 100 KB gzip on a device that may never start WebGL. Positions are plain
  tuples; the world converts them.
- **The station is lazily imported and the rest is not.** The boot screen, the
  copy and the written document are interactive before three.js is fetched,
  and a device with no WebGL context never downloads it at all.
- **Every texture and every in-world label is drawn on a canvas at runtime.**
  No image assets beyond the screenshots, no font parsing, no CDN. Labels are
  drawn after `document.fonts.ready` — see the note in `src/main.tsx`, because
  a canvas bakes in whatever face was available at the moment it drew.
- **Movement never touches React state.** `lib/input` is written by every
  control surface and read once per frame; the player's position is a module
  vector the camera and the proximity tests share. React only hears about
  things a person would notice changing.
- **Quality is decided once in `lib/perf`.** Shadows, ambient occlusion, the
  particle counts and the device pixel ratio all read the tier, rather than
  ten components each checking `isMobile` and drifting apart.
- **Signs are single-sided.** Text on a double-sided plane renders mirrored
  from behind. The facing maths is in `onRing` in `data/zones.ts`.
- **Audio never autoplays.** The context is not even constructed until the
  SOUND button is pressed.
- **`prefers-reduced-motion` is honoured throughout** — the arrival move, the
  gyros, the dust, the pulses and the avatar's gait all check it.

## Deployment

Vercel, configured in `vercel.json`:

- build `npm run build` → output `dist`
- SPA rewrites, so any path serves the app
- immutable caching for hashed assets and fonts
- `Access-Control-Allow-Origin: *` on `/assets`, `/fonts` and `/projects`

No environment variables are required.

### Choosing between `azamjonbro.uz` and `www`

**Do this in Vercel's dashboard — Settings → Domains — not in `vercel.json`.**

Add both domains and mark the apex as primary; Vercel then issues the
`www` → apex redirect at the domain layer.

This is not a stylistic preference. A host redirect written as a `redirects`
rule in `vercel.json` is applied per request, including to `/assets/*.js`,
`/assets/*.css` and `/fonts/*.woff2`. Scripts, stylesheets and fonts are all
fetched in CORS mode, so redirecting one of them to a different host requires
an `Access-Control-Allow-Origin` header on the response it lands on — and
without it the browser blocks the load. The result is a page that serves its
HTML and nothing else: no styles, no bundle, no fonts.

A domain-level redirect happens on the document request, before a single
subresource has been asked for, so the whole page is already on one origin by
the time it starts loading anything. The `Access-Control-Allow-Origin` headers
above are a second line of defence, so a host mismatch can never blank the
site again.

## Known issues

- `@react-three/fiber` constructs `THREE.Clock`, which three r185 deprecated,
  so the console carries a deprecation warning at startup. It comes from the
  library, not from this code, and cannot be fixed here without patching a
  dependency. It is a warning, not an error, and nothing is recreated at
  runtime.
