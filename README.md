# Tamires Lelis — Portfolio

A product design portfolio presented as a Windows XP desktop: a boot
screen, a desktop with case-study "folders," and case studies that open
in XP-chrome windows with slide navigation.

Built with **React + TypeScript + Vite**, no backend, no global state
library — see [Architecture](#architecture) for why.

See [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) for the checklist
this build is held to, and its current status.

## Getting started

```bash
npm install
npm run dev       # starts the Vite dev server (http://localhost:5173)
```

```bash
npm run build      # type-checks (tsc -b) and produces a production build in dist/
npm run preview    # serves the dist/ build locally, to sanity-check the build
npm run lint        # oxlint
```

Node 20+ is recommended.

## Project structure

```
src/
  assets/
    boot/                    # boot screen is CSS/SVG — see the README there
    desktop/                 # wallpaper + folder icon (placeholders, see below)
    cases/
      itau/
      insense-onboarding/
      insense-ai/            # placeholder slide artwork per case study

  components/
    Portfolio/                # top-level state container
    XPBootScreen/             # full-viewport boot/loading screen
    PortfolioDesktop/         # wallpaper + folders + case window + taskbar
    PortfolioFolder/          # one desktop icon
    XPTaskbar/                 # start button, active-window button, clock
    CaseWindow/                # XP window chrome hosting a case study
    CaseSlide/                  # one slide's artwork + caption
    SlideNavigation/            # prev/next arrow buttons
    SlideCounter/                # "n / total" readout
    NavigationTooltip/            # first-time "use ← → or swipe" hint

  config/
    timing.ts                 # the two boot durations, centralized (see below)

  data/
    cases.ts                  # case-study content model + data

  hooks/
    useBootSequence.ts        # owns the boot-screen timer
    useStartupSound.ts        # plays the XP chime once, initial boot only
    useKeyboardNavigation.ts  # ← → to navigate slides, Esc to close
    useSwipeNavigation.ts     # touch swipe to navigate slides

  styles/
    theme.css                 # design tokens (colors, type, spacing, z-index)
    global.css                # reset + base styles

  App.tsx
  main.tsx
```

Each component folder holds its `.tsx`, a colocated `*.module.css` (CSS
Modules — scoped by default, zero extra config via Vite), and an
`index.ts` barrel export.

## Architecture

- **State** lives in `Portfolio.tsx` as plain `useState`/`useCallback`,
  matching the brief's conceptual model (`bootMode`, `activeCase`,
  `currentSlide`, `hasSeenNavigationTooltip`). No Redux/Zustand/etc. —
  there's nothing here that outgrows React state.
- **The two boot durations** (`INITIAL_BOOT_DURATION = 2000`,
  `START_BOOT_DURATION = 1000`) are defined once in
  `src/config/timing.ts` and consumed through the `useBootSequence`
  hook, which owns the single `setTimeout` that clears `bootMode`. No
  duplicated, unexplained `setTimeout(..., 2000)` calls anywhere else.
- **Three distinct exit paths**, as specified:
  - Initial load → `XPBootScreen` for 2000ms → desktop (smooth opacity
    cross-fade, not a reload).
  - Start button → `activeCase`/`currentSlide` reset immediately,
    `XPBootScreen` for 1000ms → desktop.
  - Red X / <kbd>Escape</kbd> → case closes immediately, no boot screen.
- **Keyboard & swipe navigation** are hand-rolled
  (`useKeyboardNavigation`, `useSwipeNavigation`) against native
  `keydown`/`touchstart`/`touchend` events — no carousel or gesture
  library.
- **CSS Modules** for styling (Vite supports `*.module.css` out of the
  box) plus a shared `theme.css` token file, instead of a CSS-in-JS
  library or a utility framework.

## Startup sound

The XP startup chime (`src/assets/audio/windows-xp-startup.wav` — see
the placeholder note below) plays exactly once: the first time the
*initial* boot finishes and the desktop appears. It does **not** play
for the start button's reboot, for opening/closing/switching cases, for
slide navigation, or on any later render.

- `useStartupSound(bootMode)` (`src/hooks/useStartupSound.ts`) watches
  for the specific `"initial" → null` transition in `bootMode` — the
  same state `useBootSequence` already owns — rather than "the desktop
  is visible," so it can't fire for the `"start" → null` transition.
- A `sessionStorage` flag (`portfolio-startup-sound-played`) makes
  "already played" durable across re-renders and even a reload within
  the same tab, per the brief.
- Volume is fixed at `0.6`, `loop` is `false`, and a rejected
  `play()` promise (autoplay blocked) is caught — it falls back to
  playing on the visitor's very first click/keypress instead, still at
  most once, and never throws or blocks the UI either way.

**Placeholder note:** no audio file was attached to this project, and
the real Windows XP startup sound ("The Microsoft Sound") is
Microsoft's copyrighted property, so it wasn't sourced from the
internet automatically. The shipped `.wav` is a short synthesized
three-note chime standing in for it — see
`src/assets/audio/README.md` for how to swap in the real file.

## About the Figma design

This environment doesn't have Figma Dev Mode / MCP access, and the
shared Figma link isn't reachable from here (`403`, since Figma design
links require an authenticated session in a browser). I could not pull
exact frame dimensions, spacing, or hex values from
`oSGVa81H3NHJO0hxS9WAbg`, node `6629-24192`.

Instead, the visual system (`src/styles/theme.css`) is built from
well-documented, authentic Windows XP "Luna" theme metrics: a 30–34px
taskbar, a green gradient start button, a blue-gradient title bar with a
red close button, Tahoma-first typography, etc. Every token is a CSS
custom property in one file, so once you have the file open in Figma
yourself, tightening colors/spacing/sizes to match exactly is a
find-and-tune job in `theme.css` and the per-component `*.module.css`
files — the component structure and behavior won't need to change.

If you're able to share exported values (a `tokens.json`/style
dictionary export, or just the numbers) or screenshots, I can match
them precisely.

## Case-study assets

**Itaú** (`src/assets/cases/itau/`) uses the real 10-slide deck (cover,
business context, understanding the existing experience, userflow,
usability test, usability data analysis, v1-vs-final, accessibility
specifications, handoff, outcome), exported from the source PDFs to
JPEG. Each slide's `alt` text in `src/data/cases.ts` describes what's on
it (headline, key stats, screenshots) for screen-reader users, since the
text lives inside the image.

The two **Insense** cases still ship with lightweight, clearly-labeled
SVG placeholders so the app runs and looks reasonable out of the box:

- `src/assets/desktop/wallpaper.svg` — an abstract sky/hills wallpaper
  (an homage, not a reproduction of the real "Bliss" photo).
- `src/assets/desktop/folder-icon.svg` — a redrawn classic yellow folder.
- `src/assets/cases/insense-{onboarding,ai}/slide-*.svg` — 5 generic
  slides per case (cover, context, process, solution, outcome), each
  labeled "Placeholder artwork — replace with exported Figma slide."
- `src/assets/boot/` — no bitmap needed; the boot screen is CSS/SVG
  (see the README in that folder for how to swap in a real screenshot
  instead).

**To use real content:** drop your exported images into the matching
`src/assets/cases/<case>/` folder and update the `image`/`alt` (and
optional `caption`) fields in `src/data/cases.ts` — the same way Itaú's
were swapped in. The slide count per case isn't hardcoded anywhere else,
so adding/removing slides just means editing that array.

## Accessibility

- Folders and all controls are real `<button>`s with descriptive
  `aria-label`s; the case window is a labeled `role="dialog"` with
  focus moved in on open and restored to the triggering folder on
  close.
- <kbd>←</kbd>/<kbd>→</kbd> navigate slides, <kbd>Esc</kbd> closes the
  case window; the slide counter announces changes via
  `aria-live="polite"`.
- `prefers-reduced-motion: reduce` shortens/disables the boot screen's
  animations and cross-fade transitions globally (`theme.css`).
- Focus is visible everywhere via a high-contrast `:focus-visible` ring
  that reads against both the blue desktop and the light window chrome.

## Responsive behavior

- Desktop icons run in a left-hand column above ~600px, and wrap into a
  horizontal row near the top on narrower screens.
- The case window is a centered, fixed-size floating window above
  ~600px, and expands to fill the viewport (minus the taskbar) below
  that, with larger (44px) touch targets for the prev/next controls.
- The taskbar collapses the "start" label to just its icon below 480px
  to leave room for the active-case button and clock.

## Deployment

This is a static Vite build — `npm run build` outputs `dist/`, which
can be deployed to any static host (Vercel, Netlify, GitHub Pages,
Cloudflare Pages, S3, etc.) with no server-side requirements. If
deploying under a sub-path (e.g. GitHub Pages project pages), set
Vite's [`base`](https://vite.dev/config/shared-options.html#base)
option in `vite.config.ts` accordingly.
