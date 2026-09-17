# Tamires Lelis — Portfolio

A product design portfolio presented as a Windows XP desktop: a boot
screen, a desktop with case-study "folders," and case studies that open
in XP-chrome windows with slide navigation.

Built with **React + TypeScript + TanStack Start + Tailwind CSS**, no
backend, no global state library — see [Architecture](#architecture) for
why. Deploys as a fully static site (see
[Deployment](#deployment--github-pages)) — nothing here needs a server at
runtime.

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

## Deployment (GitHub Pages)

Every push to `main` builds and deploys automatically via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), using
GitHub's official `actions/*-pages` actions — no `gh-pages` npm package,
no manual `git push` to a `gh-pages` branch. You can also trigger a
deploy by hand from the Actions tab (`workflow_dispatch`).

**One-time setup, per repository:** Settings → Pages → Source →
**GitHub Actions**. That's the only manual step — everything else
(build, base path, artifact upload, deploy) is handled by the workflow.

This app has no server-only functionality (no loaders, no server
functions, no APIs) — everything is client-side React state — so it's
built as a fully static site rather than deployed as a live TanStack
Start server, which GitHub Pages can't run anyway (it only serves
static files):

- `vite.config.ts` sets `prerender: { enabled: true }` on the
  `tanstackStart()` plugin. This makes `vite build` render the app's one
  route (`/`) to a real `dist/client/index.html` at build time —
  actual markup, hydrated by the browser from there, not a live
  server rendering it per-request. `dist/server/` still gets built (the
  prerender step needs it internally to do that one-time render) but
  is never deployed — only `dist/client/` is.
- **Base path:** GitHub Pages serves a project site from
  `https://<user>.github.io/<repo-name>/`, not the domain root, so every
  asset and route URL needs that prefix. `vite.config.ts` reads
  `GITHUB_REPOSITORY` — a variable GitHub Actions sets automatically on
  every run — to compute `/<repo-name>/` with no repository name
  hardcoded anywhere and nothing to configure in the workflow. Locally,
  where that variable doesn't exist, it resolves to `/`, so
  `npm run dev`/`npm run build` behave exactly as before. The client
  router (`src/router.tsx`) picks up the same value automatically via
  Vite's built-in `import.meta.env.BASE_URL`.
- **Refreshing a route / deep links:** unlike a real server, GitHub
  Pages can't run app code to handle arbitrary paths, so a hard refresh
  on anything other than the exact deployed file would 404. The fix is
  the standard static-host trick: `scripts/postbuild-gh-pages.mjs` (run
  as part of `npm run build`) copies the built `index.html` to
  `404.html`. GitHub Pages serves `404.html` for any unmatched path, so
  the app still boots normally and the router takes it from there. The
  same script also drops a `.nojekyll` file, which stops GitHub Pages
  from running its default Jekyll processing over the build output —
  Jekyll ignores `_`-prefixed files/folders by convention, which could
  otherwise silently break a future build.

**Local sanity check:** `npm run preview` serves `dist/client/` at the
domain root (no subpath), which is enough to catch build errors but
won't reproduce GitHub Pages' `/repo-name/` prefix. To check that
specifically, build with `GITHUB_REPOSITORY=<user>/<repo> npm run build`
and serve `dist/client/` from a subfolder matching the repo name.

**If this repository has no Git remote yet:** create the GitHub
repository first (matching whatever name you used above, or update
accordingly), then:

```bash
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

The workflow runs automatically on that push once Pages' source is set
to GitHub Actions (see above).

## Project structure

```
src/
  assets/
    boot/                    # boot screen is CSS/SVG — see the README there
    desktop/                 # wallpaper, flag mark, folder icon (see below)
    cases/
      itau/
      insense-onboarding/
      insense-ai/
      quick-win/
    audio/                   # the XP startup chime (see below)
    resume/                  # the original resume PDF (see below)

  components/
    Desktop.tsx              # wallpaper + folders + case/resume window + taskbar
    DesktopFolder.tsx        # one desktop icon
    Taskbar.tsx              # the taskbar shell
    StartButton.tsx          # the green Start button
    CaseWindow.tsx           # XP window chrome hosting a case study's slides
    CaseSlide.tsx            # one slide's artwork + caption
    SlideNavigation.tsx      # prev/next arrow buttons
    SlideCounter.tsx         # "n / total" readout
    NavigationTooltip.tsx    # first-time "use ← → or swipe" hint
    ResumeWindow.tsx         # XP window chrome hosting the resume document
    XPBootScreen.tsx         # full-viewport boot/loading screen

  config/
    timing.ts                # the two boot durations, centralized (see below)

  data/
    cases.ts                 # case-study content model + data
    resume.ts                # resume content model + data

  hooks/
    useBootSequence.ts        # owns the boot-screen timer
    useStartupSound.ts        # plays the XP chime on every boot->desktop transition
    useKeyboardNavigation.ts  # ← → to navigate slides, Esc to close
    useSwipeNavigation.ts     # touch swipe to navigate slides

  routes/
    __root.tsx               # HTML shell, <head> tags, global stylesheet link
    index.tsx                # the page: owns all app state, renders Desktop + XPBootScreen

  router.tsx                  # TanStack Router instance
  routeTree.gen.ts             # generated — do not hand-edit
  styles.css                   # Tailwind entry + design tokens (@theme) + keyframes

scripts/
  postbuild-gh-pages.mjs      # turns the build output into a GitHub Pages-ready static site

.github/workflows/
  deploy.yml                   # builds + deploys to GitHub Pages on every push to main
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
  State covers `bootMode`, `activeCaseId`, `currentSlide`, `isResumeOpen`,
  and `hasSeenNavigationTooltip`. `isResumeOpen` is mutually exclusive
  with `activeCaseId` — opening one explicitly closes the other, so only
  one window is ever on screen, matching every existing "back to
  desktop" path (Start, close, boot). No Redux/Zustand/etc. — there's
  nothing here that outgrows React state.
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
~4.95s — see `src/assets/audio/README.md` for provenance) plays every
time the black boot/loading screen finishes and the desktop appears —
the initial load *and* every subsequent Start-button reboot alike, since
both are the same transition. It does not play for opening/closing/
switching cases, for slide navigation, or on any other render.

- `useStartupSound(bootMode)` (`src/hooks/useStartupSound.ts`) watches
  for any transition from a non-null `bootMode` to `null` — the same
  state `useBootSequence` already owns — rather than "the desktop is
  visible," so re-renders that don't represent an actual boot ending
  can't trigger a replay. One `Audio` element is created once and
  reused (rewound to the start each time) rather than a new one per
  play.
- No unmuted sound can autoplay before the visitor has interacted with
  the page at all, in any modern browser — that's browser policy, not
  something client-side code can override. So only the very first
  attempt (right after the initial 2s boot, if the visitor hasn't
  touched the page yet) is likely to be rejected; the hook catches
  that and retries once, inside the visitor's next genuine interaction
  (`pointerdown`, `pointerup`, `touchend`, `mousedown`, or `keydown` —
  deliberately more than just `click`, since engines and input types
  differ on which of these they treat as sufficient activation for
  unlocking playback). Once the visitor has interacted with the page
  at all — which clicking Start itself counts as — the browser's
  autoplay policy stays unlocked for the rest of the session, so every
  later reboot plays immediately with no fallback needed. A fresh
  reboot also cancels any not-yet-retried fallback from a previous one,
  so an old pending retry can't also fire (double-playing) off of the
  new transition's own click.
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

All four cases use their real decks, exported from the source PDFs to
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
- **Quick Win** (`src/assets/cases/quick-win/`, Ritchie Bros) — 7
  slides: cover, question, diagnosis, user perception, goal, usability
  issue, closing.

The desktop background is the real "Bliss" photo (see
`src/assets/desktop/README.md` for provenance and size/quality notes);
the rest of the desktop chrome is hand-drawn CSS/SVG rather than bitmap
screenshots, redrawn to match reference screenshots the project owner
shared of the real boot screen and desktop:

- `src/assets/desktop/wallpaper.webp` — the real "Bliss" photograph,
  supplied by the project owner, used as-is at its original 1200×965
  resolution (~111KB).
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
all four cases' real decks were added. The slide count per case isn't
hardcoded anywhere else, so adding/removing slides just means editing
that array.

**To add a whole new case-study folder:** add an entry to the `cases`
array in `src/data/cases.ts` (`id`, `folderLabel`, `title`, `summary`,
`slides`) and drop its artwork in a matching
`src/assets/cases/<id>/` folder — that's it. `Desktop.tsx` renders one
folder icon per entry in `cases` automatically, so no component needs
to change; this is exactly how the Quick Win folder was added.

**Note on asset inlining:** `vite.config.ts` sets
`build.assetsInlineLimit: 0`, so assets like these always resolve to
real, independently-cacheable file URLs instead of being inlined as
`data:` URIs. That matters specifically for the wallpaper: a CSS
`background-image` set to a `data:` URI can silently fail to render
under some browser security configurations, while a normal file URL
doesn't have that problem.

## Resume

The fourth desktop folder, "Resume," opens `ResumePasswordDialog` — a
small, non-resizable modal styled after the classic Windows XP network
credentials prompt ("Connect to &lt;server&gt;"), repurposed as a soft
gate: a short bio, a "Password required to see full resume" field, and
OK/Cancel. There's no real backend or password to check on a static
site, so both buttons just close it — the point isn't validating a
secret, it's pointing visitors at LinkedIn instead of publishing the
full resume outright.

The original full resume view (`ResumeWindow.tsx` + `src/data/resume.ts`
— real semantic HTML content, plus a "Download PDF" link to
`src/assets/resume/tamires-lelis-resume.pdf`) is still in the codebase,
just not wired to the folder anymore. Swapping `ResumePasswordDialog`
back for `ResumeWindow` in `Desktop.tsx` (one import, one line) restores
it if the full resume should be open again later.

Opening the resume dialog and opening a case are mutually exclusive
(see `isResumeOpen` in [Architecture](#architecture)) — only one window
is ever open at a time, same as everywhere else in the app.

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
