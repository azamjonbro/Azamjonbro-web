# Project screenshots

Every file here is a **generated placeholder plate**, not a real screenshot —
a designed card carrying the project's number, category, name and domain, so
the site looks finished today.

## Replacing one

Overwrite the file. Nothing else changes — no code edit, no config.

| File                     | Project             | Live site            |
| ------------------------ | ------------------- | -------------------- |
| `dacha.webp`             | Dacha               | —                    |
| `oil.webp`               | Oil                 | —                    |
| `swisswatchpremium.webp` | Swiss Watch Premium | swisswatchpremium.uz |
| `algoritmedu.webp`       | Algoritm Education  | algoritmedu.uz       |
| `oxfordedu.webp`         | Oxford Education    | oxfordedu.uz         |
| `alharameen.webp`        | Al-Harameen         | alharameen.uz        |
| `spring.webp`            | Spring / SDS Max    | —                    |

## What the file should be

- **Format:** WebP. Keep the `.webp` extension — the paths are referenced from
  `src/data/projects.ts`.
- **Aspect ratio:** 16:10. The placeholders are 1760 × 1100. The exhibit
  hologram in the world uses a 16:10 plane, so a very different ratio will
  letterbox there.
- **Size:** under ~150 KB each. All seven are loaded when the station builds,
  because each one is mapped onto its hologram in the projects bay.

Producing one from a screenshot:

```bash
cwebp -q 82 -resize 1760 0 screenshot.png -o public/projects/dacha.webp
```

## Adding an eighth project

Add an entry to `projects` in `src/data/projects.ts` and drop its image here.
The exhibit in the bay, the arc it stands on, the panel, the bay directory and
the written fallback all read from that one array.
