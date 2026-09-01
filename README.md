# azamjonbro.uz

One room. No scrolling.

The entire portfolio is a single interactive 3D developer workspace. There are no
sections that replace each other, no camera journey, no scroll progress — the room
*is* the site. Move the mouse to look around, hover anything to name it, click to
inspect it, and click the monitor to sit down and use the machine.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run lint
```

## How it fits together

```
src/
├── components/
│   ├── room/            everything inside the <Canvas>
│   │   ├── RoomScene    canvas, post-processing, scene assembly
│   │   ├── CameraRig    damped mouse-look, orbit-style
│   │   ├── Shell        floor, walls, window, curtains, shelf
│   │   ├── Desk         marble top, steel frame, cable run
│   │   ├── Props        every interactive object on the desk
│   │   ├── WallDisplays the three project panels
│   │   ├── MonitorScreen the machine, rendered as real DOM in 3D
│   │   └── Hotspot      the shared interaction contract
│   └── ui/              overlays outside the canvas
│       ├── InfoPanel    one panel renders every object
│       ├── Tooltip, Hint, LoadingScreen, RoomHud, ResumeViewer
│       └── computer/    FileExplorer · CodeEditor · Terminal
├── data/
│   ├── interactiveObjects.ts   what every object says when clicked
│   ├── projects.ts             SwissWatch · Hadiya · CTF Platform
│   └── fileSystem.ts           the virtual filesystem the IDE browses
├── hooks/               useObjectInteraction · useCameraInteraction · useVirtualFileSystem
├── lib/                 layout (single source of geometry truth) · textures · pointer
└── state/RoomContext    hover, selection, view mode, discovery
```

### Interaction

```
3D object → onPointerOver → hover state → tooltip
                          → onClick → selected → <InfoPanel />
```

Every prop goes through `<Hotspot id="…">`, which supplies the pointer cursor, the
tooltip, the hover outline (drawn by the post-processing `Outline` pass) and the
click. Panel content comes from `data/interactiveObjects.ts` — there is no
component written per object.

### The machine

The monitor is not a texture. `MonitorScreen` renders a real DOM tree through
drei's `<Html transform>`, mapped onto the physical panel, so the editor, file
explorer and terminal are genuinely interactive. Clicking the screen moves the
camera to a seated position and enables pointer events; `Esc` steps back.

The filesystem in `data/fileSystem.ts` is simulated. The terminal accepts
`help`, `whoami`, `projects`, `stack`, `open <id>`, `contact`, `ls` and `clear`
and never executes anything.

### Things worth knowing before editing

- **`lib/layout.ts` is the single source of geometry truth.** The camera, the
  monitor and the wall displays all read from it, so they cannot drift apart.
- **Textures are procedural.** Marble, the night skyline, the rug, the keycaps and
  the project panels are all generated on a canvas at runtime — no image assets and
  no CDN. The environment map is built in-scene from `<Lightformer>`s for the same
  reason.
- **`CameraRig` orbits the anchor point rather than turning in place.** A head turn
  makes objects slide out from under the cursor as you reach for them; an orbit
  keeps them still. It also replays the last pointer event while the camera settles,
  so hover never goes stale and a click never misses what the tooltip named.
- **`onPointerMissed` checks the event target.** R3F attaches its listeners to the
  canvas' parent, so clicks inside the monitor's DOM arrive there too; without the
  check, using the IDE would close whatever panel was open.
- **Small props carry an invisible `<HitBox>`.** Raycasting ignores `visible`, so a
  mouse or a clock gets a hit area a person can actually land on.
