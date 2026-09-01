---
slug: making-a-catalogue-feel-expensive
title: Making a catalogue feel expensive
project: Swiss Watch Premium
summary: On a luxury storefront, the loading behaviour is part of the product. Most of the work is not making it fast — it is making it never look cheap.
status: draft
tags: [Vue.js, Frontend, Performance]
---

Swiss Watch Premium is a storefront for luxury watches. The catalogue is not
the interesting part. The interesting part is that on a site like this,
**how it loads is part of what is being sold.**

A product page that snaps into place with the image last, after a grey box and
a reflow, has already told the visitor something about the house selling it.

## Fast and smooth are different problems

They get conflated constantly. They are not the same:

- **Fast** is how long until the content is there.
- **Smooth** is whether anything jumps, flashes or reflows on the way.

A page can load in 600ms and feel cheap because the layout moved four times.
A page can take two seconds and feel considered because it arrived in one
piece. On a storefront where the whole proposition is restraint, the second
one wins.

## Reserve the space before you have the image

Almost all layout shift is one mistake: an element whose size is only known
once its content arrives.

```html
<!-- The page has no idea how tall this is until it downloads -->
<img src="/watch.webp" alt="…" />

<!-- The browser can reserve the exact box immediately -->
<img src="/watch.webp" alt="…" width="1600" height="2000" />
```

`width` and `height` on an image are not sizing instructions — CSS still
controls the rendered size. They give the browser the **aspect ratio**, which
is enough to reserve the right box before a single byte of the image has
arrived. Nothing moves when it lands.

The same principle covers fonts, banners, anything conditional. If it will
occupy space, it should occupy that space from the first frame.

## Fonts: choose which compromise you want

A custom face has exactly three behaviours and you are picking one whether you
think about it or not:

- `font-display: swap` — text appears immediately in a fallback, then
  re-renders. Nothing is invisible, but there is a visible flash.
- `font-display: optional` — text appears in the fallback and the custom face
  is only used if it arrived in time. No flash, no shift, and sometimes the
  brand face is skipped.
- `font-display: block` — invisible text for up to three seconds.

On a page where typography carries the tone, `optional` with a preload gets
the face nearly every time and never flashes:

```html
<link rel="preload" href="/fonts/display.woff2" as="font"
      type="font/woff2" crossorigin />
```

The `crossorigin` attribute is not optional. Fonts are fetched in CORS mode,
so a preload without it is a *second* request, not a head start.

## Load the first screen, defer the rest

The catalogue does not need every product image at once, and the hero does not
need to wait behind them.

```html
<img src="/hero.webp" fetchpriority="high" />        <!-- the one that matters -->
<img src="/grid-12.webp" loading="lazy" decoding="async" />  <!-- the rest -->
```

`loading="lazy"` on everything is a common overcorrection: put it on the hero
and you have delayed the exact image the page is judged by. Lazy-load what is
below the fold. Prioritise what is above it.

## Motion is a budget

The temptation on a premium site is to animate everything. The effect is the
opposite of the intent — constant motion reads as busy, and busy is cheap.

Useful constraints:

- One thing moves at a time.
- Transitions are 200–400ms. Faster feels twitchy, slower feels broken.
- Ease out, not ease-in-out, for anything entering. Things arrive quickly and
  settle.
- Animate `transform` and `opacity` only. Everything else asks the browser to
  redo layout on every frame.
- Honour `prefers-reduced-motion`. Some people get sick from the rest of it.

## The part worth keeping

Perceived performance is not a trick played on the visitor. Reserving space,
prioritising the image that matters and not moving things after they land are
all just doing the work properly. The site feels expensive because nothing in
it was left to chance — which is the same reason the watches do.
