# Desktop assets

- `wallpaper.webp` — the real Windows XP "Bliss" photograph (Charles
  O'Rear), supplied directly by the project owner for this personal,
  non-commercial portfolio. It replaced an earlier hand-drawn SVG
  recreation once the real file was available. It's a commercially
  licensed stock photo (historically distributed through Getty/
  Microsoft); it wasn't sourced from the internet by me — keep that in
  mind if this repo or its deployment ever goes fully public/commercial,
  same as the note in the README about the startup sound.
- `xp-flag.svg` — the four-color flag mark used in the boot screen and
  the taskbar's Start button (redrawn, not traced from Microsoft's
  artwork).
- `folder-icon.svg` — a redrawn classic yellow folder.

## Wallpaper size/quality notes

`wallpaper.webp` is used as-is (no re-compression) at 1200×965,
~111KB — already lossy WebP, so re-encoding it again would only lose
quality for no real size benefit. `vite.config.ts` disables asset
inlining (`assetsInlineLimit: 0`), so it's always served as its own
cacheable file rather than bloating the page's HTML/JS as a `data:`
URI.

`background-size: cover` (in `Desktop.tsx`) handles all viewport
adaptation — it crops rather than stretches, so it never distorts, and
there's no separate mobile asset: at typical mobile viewport widths
this 1200px-wide source is already sharp, and 111KB is small enough
that shipping one variant for every screen size isn't worth the added
complexity of a responsive `image-set()`/media-query swap. If a much
smaller mobile-specific variant becomes worth it later (e.g. a
significantly larger source image comes in), that's a scoped addition
to `Desktop.tsx`'s background style, not a structural change.
