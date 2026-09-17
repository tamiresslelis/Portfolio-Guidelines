# Desktop assets

- `wallpaper.webp` / `wallpaper-mobile.webp` — the real Windows XP
  "Bliss" photograph (Charles O'Rear). The current files are a
  higher-resolution copy the project owner sourced from
  wallpaperswide.com (an unofficial reupload of the same photo, not an
  official Microsoft/Getty source) and supplied directly for this
  personal, non-commercial portfolio; I wasn't the one who found or
  downloaded it. The site's own "WALLPAPERSWIDE.COM" watermark badge,
  baked into the bottom-right corner of the original files, was cropped
  out (not inpainted — the affected bottom strip of the image was
  removed entirely) before resizing/re-encoding. It's still the same
  underlying commercially-licensed stock photo either way — keep that
  in mind if this repo or its deployment ever goes fully public/
  commercial, same as the note in the README about the startup sound.
- `xp-flag.svg` — the four-color flag mark used in the boot screen and
  the taskbar's Start button (redrawn, not traced from Microsoft's
  artwork).
- `folder-icon.svg` — a redrawn classic yellow folder.

## Wallpaper size/quality notes

Two sizes, both cropped from the same watermark-free 3840×2060 source
(re-encoded once, not recompressed further):

- `wallpaper.webp` (desktop) — 1920×1030, ~143KB, WebP quality 82.
- `wallpaper-mobile.webp` — 960×515, ~42KB, WebP quality 80.

`vite.config.ts` disables asset inlining (`assetsInlineLimit: 0`), so
both are always served as their own cacheable files rather than
bloating the page's HTML/JS as `data:` URIs.

`background-size: cover` (the `.xp-wallpaper` class, `styles.css`)
handles all viewport adaptation within a given image — it crops rather
than stretches, so it never distorts. Which of the two files loads is
decided by a plain CSS media query (`.xp-wallpaper` in `styles.css`,
mobile-first, swapping to the desktop file above 600px — the same
breakpoint `Desktop.tsx` already uses elsewhere): only the matching
file is ever requested by the browser, not both, so phones aren't made
to download the larger desktop image. The two Vite-resolved URLs reach
that CSS as `--wallpaper-mobile`/`--wallpaper-desktop` custom
properties set inline from `Desktop.tsx`, since only JS/Vite can
resolve an asset import to its real hashed file URL.
