# Project screenshots

Every file in this folder is a **generated placeholder plate**, not a real
screenshot. Each one is a designed, on-brand card carrying the project's
number, category, title and domain, so the site looks finished today.

## Replacing one

Overwrite the file. Nothing else changes — no code edit, no rebuild config.

| File                       | Project             | Live site               |
| -------------------------- | ------------------- | ----------------------- |
| `dacha.webp`               | Dacha               | —                       |
| `oil.webp`                 | Oil                 | —                       |
| `swisswatchpremium.webp`   | Swiss Watch Premium | swisswatchpremium.uz    |
| `algoritmedu.webp`         | Algoritm Education  | algoritmedu.uz          |
| `oxfordedu.webp`           | Oxford Education    | oxfordedu.uz            |
| `alharameen.webp`          | Al-Harameen         | alharameen.uz           |
| `spring.webp`              | Spring — SDS Max    | spring.sds-max.uz       |

## What the file should be

- **Format:** WebP. Keep the `.webp` extension — the paths are referenced from
  `src/data/projects.ts`.
- **Aspect ratio:** 16:10. The placeholders are 1760 × 1100. Anything close is
  fine; the plates are rendered with `object-fit: cover` in the cursor preview
  and at full width in the case study, so a very different ratio will crop.
- **Size:** aim for under ~150 KB each. All seven load on the projects
  section, at low priority.

Producing one from a screenshot:

```bash
cwebp -q 82 -resize 1760 0 screenshot.png -o public/projects/dacha.webp
```

## Adding an eighth project

Add an entry to `projects` in `src/data/projects.ts` and drop its image here.
The index number, the case study, the navigation and the room's wall panels
all read from that one array.
