# Tamires Lelis — Portfolio

A product design portfolio presented as a Windows XP desktop: a boot
screen, a desktop with case-study "folders," and case studies that open
in XP-chrome windows with slide navigation.

Built with **React + TypeScript + TanStack Start + Tailwind CSS**, no
backend beyond what TanStack Start's SSR needs, no global state library
— see [Architecture](#architecture) for why.

See [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) for the checklist
this build is held to, and its current status.

## Getting started

```bash
npm install
npm run dev       # starts the dev server (http://localhost:3000)
```

```bash
npm run build           # type-checks (tsc --noEmit) and builds client + server bundles into dist/
npm run preview         # serves the production build locally, to sanity-check it
npm run lint             # oxlint
npm run generate-routes  # regenerate src/routeTree.gen.ts by hand (normally automatic)
```

**Requires Node 22.12+.** `@tanstack/react-start` declares this as a hard
engine requirement; older Node versions may emit an `EBADENGINE` warning
on install and are not guaranteed to work in every environment (this
repo was developed and verified on Node 20.20, where it happened to run
fine, but don't rely on that — match the declared requirement for
anything beyond local experimentation, especially in CI or on a
deployment host).

## Getting started → production hosting

`npm run preview` is a local sanity check, not a deployment. TanStack
Start's server build (`dist/server/`) is a generic Fetch-API handler,
not a self-starting Node server — to actually host it (Node, Vercel,
Netlify, Cloudflare, etc.) you need to pick a Nitro deployment preset;
see the [TanStack Start deployment docs](https://tanstack.com/start/latest/docs/framework/react/hosting)
for the adapter matching your target.

## Project structure

```
src/
  assets/
    boot/                    # boot screen is CSS/SVG — see the README there
    desktop/                 # wallpaper, flag mark, folder icon (see below)
    cases/
      itau/
      insense-onboarding/
      insense-ai/            # placeholder slide artwork per case study
    audio/                   # the XP startup chime (see below)

  components/
    Desktop.tsx              # wallpaper + folders + case window + taskbar
    DesktopFolder.tsx        # one desktop icon
    Taskbar.tsx              # the taskbar shell
    StartButton.tsx          # the green Start button
    CaseWindow.tsx           # XP window chrome hosting a case study
    CaseSlide.tsx            # one slide's artwork + caption
    SlideNavigation.tsx      # prev/next arrow buttons
    SlideCounter.tsx         # "n / total" readout
    NavigationTooltip.tsx    # first-time "use ← → or swipe" hint
    XPBootScreen.tsx         # full-viewport boot/loading screen

  config/
    timing.ts                # the two boot durations, centralized (see below)

  data/
    cases.ts                 # case-study content model + data

  hooks/
    useBootSequence.ts        # owns the boot-screen timer
    useStartupSound.ts        # plays the XP chime once, initial boot only
    useKeyboardNavigation.ts  # ← → to navigate slides, Esc to close
    useSwipeNavigation.ts     # touch swipe to navigate slides

  routes/
    __root.tsx               # HTML shell, <head> tags, global stylesheet link
    index.tsx                # the page: owns all app state, renders Desktop + XPBootScreen

  router.tsx                  # TanStack Router instance
  routeTree.gen.ts             # generated — do not hand-edit
  styles.css                   # Tailwind entry + design tokens (@theme) + keyframes
```

Components are flat files (no per-component CSS Modules folder anymore
— see [Architecture](#architecture)). `data/`, `config/`, and `hooks/`
are unchanged from before this stack migration: they're plain
TypeScript with no framework or styling dependency, so nothing about
the case-study content, boot timing, or the startup-sound logic needed
to change.

## Architecture

- **State** lives in `routes/index.tsx` as plain `useState`/`useCallback`
  (the route component itself, rather than a separate `Portfolio`
  wrapper — TanStack Router's file-based routing already gives `/` a
  dedicated component, so an extra wrapper would just be indirection).
  State covers `bootMode`, `activeCaseId`, `currentSlide`, and
  `hasSeenNavigationTooltip`. No Redux/Zustand/etc. — there's nothing
  here that outgrows React state.
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
- **Desktop folder interaction is authentic XP, not simplified:** a
  single click/tap selects an icon (translucent blue highlight);
  double-click opens it. <kbd>Enter</kbd>/<kbd>Space</kbd> open it in
  one step for keyboard users — requiring two key presses there would
  be an accessibility regression the mouse interaction doesn't have.
- **Keyboard & swipe navigation** are hand-rolled
  (`useKeyboardNavigation`, `useSwipeNavigation`) against native
  `keydown`/`touchstart`/`touchend` events — no carousel or gesture
  library.
- **Window controls:** the case window's minimize button is present for
  XP-chrome authenticity but styled as disabled — this window only
  supports closing (X / Escape). Maximize is real: `CaseWindow` keeps a
  local `isMaximized` boolean (reset to `false` whenever a different
  case is opened, so one window's maximize state never leaks into the
  next), and toggles between Tailwind classes that fill the desktop
  down to the taskbar and the normal centered floating window.
- **Tailwind CSS v4** for styling, with the Windows XP design tokens
  (colors, type scale, radii, shadows, animations) declared once in an
  `@theme` block in `src/styles.css` — that generates ordinary Tailwind
  utilities (`bg-xp-taskbar-start`, `text-xp-sm`, `rounded-xp-window`,
  `animate-xp-wave`, ...) rather than needing a parallel CSS-in-JS or
  CSS-Modules system. Multi-stop gradients still need one-off
  arbitrary-value utilities at their call sites (e.g.
  `bg-linear-to-b from-xp-titlebar-mid ... to-xp-titlebar-end`) — that's
  the "small custom CSS" a Tailwind-only approach can't fully avoid for
  XP-specific chrome, kept to individual `className` strings rather
  than a separate stylesheet per component.
- **TanStack Start** (file-based routing via TanStack Router, SSR by
  default) instead of a plain Vite SPA. The app has exactly one route
  (`/`) — routing itself isn't a real requirement here, but it's what
  was asked for; `routes/index.tsx` owns the same state
  `Portfolio.tsx` used to.

## Startup sound

The real XP startup chime (`src/assets/audio/windows-xp-startup.wav`,
~4.95s — see `src/assets/audio/README.md` for provenance) plays exactly
once: the first time the *initial* boot finishes and the desktop
appears. It does **not** play for the start button's reboot, for
opening/closing/switching cases, for slide navigation, or on any later
render.

- `useStartupSound(bootMode)` (`src/hooks/useStartupSound.ts`) watches
  for the specific `"initial" → null` transition in `bootMode` — the
  same state `useBootSequence` already owns — rather than "the desktop
  is visible," so it can't fire for the `"start" → null` transition.
- A `sessionStorage` flag (`portfolio-startup-sound-played`) makes
  "already played" durable across re-renders and even a reload within
  the same tab. Critically, this flag is only set from the audio
  element's `playing` event — i.e. once sound has *actually* started —
  never just because `play()` was called. Marking it any earlier means
  a blocked first attempt permanently "uses up" the one play for the
  whole session with nothing ever having been heard, which is exactly
  the bug an earlier version of this hook had.
- No unmuted sound can autoplay before the visitor has interacted with
  the page at all, in any modern browser — that's browser policy, not
  something client-side code can override. So the first `play()` call
  is expected to be rejected on a first visit; the hook catches that
  and retries once, synchronously inside the visitor's first genuine
  interaction (`pointerdown`, `pointerup`, `touchend`, `mousedown`, or
  `keydown` — deliberately more than just `click`, since engines and
  input types differ on which of these they treat as sufficient
  activation for unlocking playback). That retry uses plain
  `addEventListener`/`removeEventListener` rather than newer APIs like
  `AbortSignal`, so it degrades safely on older engines too. If that
  retry also fails, the session isn't marked as played, so a later
  reload gets a fresh chance rather than staying silent forever.
- Volume is fixed at `0.6`, `loop` is `false`, and every `play()` call
  is wrapped so a browser that doesn't return a Promise from `play()`
  (very old WebKit) can't throw an uncaught error — it's normalized
  into a real Promise either way.

**Rights note:** "The Microsoft Sound" is Microsoft's copyrighted
property. The audio file here was supplied by the project owner for
this personal, non-commercial portfolio; it wasn't sourced from the
internet by me. Keep that in mind if this repo or its deployment ever
goes fully public/commercial.

## About the Figma design

This environment doesn't have Figma Dev Mode / MCP access, and the
shared Figma link isn't reachable from here (`403`, since Figma design
links require an authenticated session in a browser). I could not pull
exact frame dimensions, spacing, or hex values from
`oSGVa81H3NHJO0hxS9WAbg`, node `6629-24192`.

Instead, the visual system (the `@theme` block in `src/styles.css`) is
built from well-documented, authentic Windows XP "Luna" theme metrics: a
34px taskbar, a green gradient start button, a blue-gradient title bar
with a red close button, Tahoma-first typography, etc., plus reference
screenshots the project owner shared directly of the real boot screen
and the "Bliss" desktop. Every token is declared once, so tightening
colors/spacing/sizes to match Figma exactly is a find-and-tune job in
that one `@theme` block plus the handful of arbitrary-value gradients —
the component structure and behavior won't need to change.

If you're able to share exported values (a `tokens.json`/style
dictionary export, or just the numbers) or screenshots, I can match
them precisely.

## Case-study assets

All three cases use their real decks, exported from the source PDFs to
JPEG. Each slide's `alt` text in `src/data/cases.ts` describes what's on
it (headline, key stats, screenshots) for screen-reader users, since the
text lives inside the image.

- **Itaú** (`src/assets/cases/itau/`) — 10 slides: cover, business
  context, understanding the existing experience, userflow, usability
  test, usability data analysis, v1-vs-final, accessibility
  specifications, handoff, outcome.
- **Insense Onboarding** (`src/assets/cases/insense-onboarding/`) — 7
  slides: cover, business context, diagnosis, research signals,
  value-exchange clarity, v1-vs-final, outcome.
- **Insense AI** (`src/assets/cases/insense-ai/`) — 3 slides: cover,
  project overview, AI review flow.

The desktop chrome is hand-drawn CSS/SVG rather than bitmap screenshots,
redrawn to match reference screenshots the project owner shared of the
real boot screen and desktop:

- `src/assets/desktop/wallpaper.svg` — a from-scratch recreation of the
  classic sky/clouds/rolling-hill wallpaper (gradients + blurred cloud
  shapes), not a reproduction of the actual "Bliss" photo.
- `src/assets/desktop/xp-flag.svg` — the four-color flag mark used in
  the boot screen and the taskbar's start button.
- `src/assets/desktop/folder-icon.svg` — a redrawn classic yellow folder.
- `src/assets/boot/` — no bitmap needed; the "Microsoft Windows xp
  Professional" boot screen (flag, wordmark, loading bar, copyright/logo
  footer) is built entirely in `XPBootScreen` with Tailwind utilities
  (see the README in that folder for how to swap in a real screenshot
  instead).

**To add or replace slides:** drop your exported images into the
matching `src/assets/cases/<case>/` folder and update the `image`/`alt`
(and optional `caption`) fields in `src/data/cases.ts` — the same way
all three cases' real decks were added. The slide count per case isn't
hardcoded anywhere else, so adding/removing slides just means editing
that array.

**Note on asset inlining:** `vite.config.ts` sets
`build.assetsInlineLimit: 0`, so small assets like these SVGs always
resolve to real, independently-cacheable file URLs instead of being
inlined as `data:` URIs. That matters specifically for the wallpaper: a
CSS `background-image` set to a `data:` URI can silently fail to render
under some browser security configurations, while a normal file URL
doesn't have that problem.

## Accessibility

- Folders and all controls are real `<button>`s with descriptive
  `aria-label`s; the case window is a labeled `role="dialog"` with
  focus moved in on open and restored to the triggering folder on
  close.
- <kbd>←</kbd>/<kbd>→</kbd> navigate slides, <kbd>Esc</kbd> closes the
  case window; the slide counter announces changes via
  `aria-live="polite"`.
- `prefers-reduced-motion: reduce` disables the boot screen's flag-wave
  and loading-bar animations via Tailwind's `motion-reduce:` variant.
- Focus is visible everywhere via a high-contrast `:focus-visible` ring
  that reads against both the blue desktop and the light window chrome.

## Responsive behavior

- Desktop icons run in a left-hand column above ~600px, and wrap into a
  horizontal row near the top on narrower screens.
- The case window is a centered, fixed-size floating window above
  ~600px, and expands to fill the viewport (minus the taskbar) below
  that, with larger (44px) touch targets for the prev/next controls.
- The taskbar collapses the "start" label to just its icon below 480px
  to leave room for the active-case button and the "Product Design
  Portfolio" label.
